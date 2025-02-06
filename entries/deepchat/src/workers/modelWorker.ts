import * as Comlink from 'comlink';
import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
  PreTrainedModel,
  PreTrainedTokenizer
} from '@huggingface/transformers';
import { ProgressStatusInfo } from '../contexts/ModelContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type StatusEvent = {
  type: "status",
  name: string;
  progress: ProgressStatusInfo;
}

export type TokenEvent = {
  type: "token",
  token: string;
}

class ModelWorker {
  private static MODEL_ID = 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX';
  private tokenizer: PreTrainedTokenizer | undefined;
  private model: PreTrainedModel | undefined;
  private streamer: TextStreamer | undefined;
  private stoppingCriteria: InterruptableStoppingCriteria;
  private pastKeyValuesCache: any = null;

  constructor() {
    this.stoppingCriteria = new InterruptableStoppingCriteria();
  }

  private dispatchProgressEvent(progress: ProgressStatusInfo, name: string) {
    self.postMessage({
      type: "status",
      name,
      progress
    } satisfies StatusEvent);
  }

  private dispatchGenerationEvent(token: string) {
    self.postMessage({
      type: "token",
      token
    } satisfies TokenEvent);
  }

  private dispatchTokenDone() {
    self.postMessage({
      type: "done"
    })
  }

  async initializeModel(): Promise<void> {
    if (this.model && this.tokenizer) return;

    try {
      console.log('Starting model initialization...');

      this.tokenizer = await AutoTokenizer.from_pretrained(ModelWorker.MODEL_ID, {
        progress_callback: (p) => {
          //@ts-expect-error
          this.dispatchProgressEvent(p, 'Tokenizer')
        }
      }).catch(error => {
        console.error('Tokenizer initialization failed:', error);
        throw error;
      });

      console.log('Tokenizer loaded');

      //@ts-expect-error
      const device = await navigator.gpu?.requestAdapter()
        //@ts-expect-error
        .then(adapter => adapter?.requestDevice())
        .catch(() => null);

      console.log('Defaulting to:', device ? 'webgpu' : 'cpu');

      this.model = await AutoModelForCausalLM.from_pretrained(ModelWorker.MODEL_ID, {
        dtype: 'q4f16',
        device: device ? 'webgpu' : 'cpu',
        use_external_data_format: {
          'model.onnx_data': true,
        },
        progress_callback: (p) => {
          //@ts-expect-error
          this.dispatchProgressEvent(p, 'Model')
        }
      }).catch(error => {
        console.error('Model initialization failed:', error);
        throw error;
      });

      this.dispatchTokenDone();
    } catch (error) {
      console.error('Error initializing model:', error);
      throw error;
    }
  }

  async generateStreamingResponse(
    prompt: string
  ): Promise<void> {
    if (!this.model || !this.tokenizer) {
      await this.initializeModel();
    }

    try {
      const messages: Message[] = [{ role: 'user', content: prompt }];
      const inputs = this.tokenizer!.apply_chat_template(messages, {
        add_generation_prompt: true,
        return_dict: true
      });

      this.streamer = new TextStreamer(this.tokenizer!, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: this.dispatchGenerationEvent,
      });

      //@ts-expect-error
      const { past_key_values, sequences } = await this.model!.generate({
        //@ts-expect-error
        ...inputs,
        past_key_values: this.pastKeyValuesCache,
        do_sample: false,
        max_new_tokens: 8192,
        top_k: 3,
        temperature: 0.2,
        streamer: this.streamer,
        stopping_criteria: this.stoppingCriteria,
        return_dict_in_generate: true,
        use_cache: true
      });

    } catch (error) {
      console.error('Error in streaming response:', error);
      throw error;
    }
  }

  interrupt() {
    this.stoppingCriteria.interrupt();
  }

  reset() {
    this.pastKeyValuesCache = null;
    this.stoppingCriteria.reset();
  }
}

Comlink.expose(new ModelWorker());

export type ModelWorkerType = ModelWorker;