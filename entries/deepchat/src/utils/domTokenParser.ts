export class DOMTokenParser {
  private container: HTMLElement;
  private currentText: string = '';
  private observer: MutationObserver | null = null;
  private thinkingContent: string = '';
  private isThinking: boolean = false;
  private thinkingElement: HTMLElement | null = null;
  private responseElement: HTMLElement | null = null;
  private tokenBuffer: string = '';
  private thinkingBuffer: string = '';

  // Token constants to prevent typos and enable easier updates
  private static readonly THINK_START = '<think>';
  private static readonly THINK_END = '</think>';

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupMutationObserver();
    this.initializeElements();
  }

  private initializeElements() {
    this.container.innerHTML = '';

    // Create and append thinking section with accordion styling
    const thinkingHTML = `
      <div class="mb-4 transition-all duration-200" style="display: none;" id="thinking-section">
        <button class="thinking-gradient-border w-full text-left rounded-lg border bg-gray-100 px-4 py-2 font-medium hover:bg-gray-200 focus:outline-none flex items-center gap-2 relative overflow-hidden group" 
                onclick="this.nextElementSibling.classList.toggle('hidden'); 
                        this.querySelector('.chevron-right')?.classList.toggle('hidden');
                        this.querySelector('.chevron-down')?.classList.toggle('hidden');
                        this.classList.toggle('rounded-b-none')"
        >
          <svg class="chevron-right w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          <svg class="chevron-down w-4 h-4 hidden" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          <span>Thinking Process</span>
        </button>
        <div class="hidden border-x border-b border-gray-200 rounded-b-lg">
          <div class="px-4 py-2 text-sm text-gray-600" data-testid="thinking-content"></div>
        </div>
      </div>
    `;

    // Response section
    const responseHTML = `
      <div data-testid="response-content">
        <div class="response-text"></div>
      </div>
    `;

    this.container.insertAdjacentHTML('beforeend', thinkingHTML);
    this.container.insertAdjacentHTML('beforeend', responseHTML);

    // Get references to elements
    this.thinkingElement = this.container.querySelector('#thinking-section');
    this.responseElement = this.container.querySelector('[data-testid="response-content"]');

    // Verify elements exist
    if (!this.thinkingElement || !this.responseElement) {
      console.error('Failed to initialize elements:', {
        thinking: this.thinkingElement,
        response: this.responseElement,
        container: this.container.innerHTML
      });
      throw new Error('Failed to initialize DOM elements');
    }
  }

  private setupMutationObserver() {
    this.observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        this.container.scrollTop = this.container.scrollHeight;
      });
    });

    this.observer.observe(this.container, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  public appendToken(token: string) {
    if (!token) return;

    try {
      this.tokenBuffer += token;

      console.log('Token received:', token);
      console.log('Current buffer state:', {
        tokenBuffer: this.tokenBuffer,
        thinkingBuffer: this.thinkingBuffer,
        isThinking: this.isThinking
      });

      while (this.tokenBuffer.length > 0) {
        const lowerBuffer = this.tokenBuffer.toLowerCase();

        // Wait until we have a complete pair of think tags
        if (!this.isThinking && lowerBuffer.includes(DOMTokenParser.THINK_START)) {
          const startIndex = lowerBuffer.indexOf(DOMTokenParser.THINK_START);

          // If we don't have an end tag yet, keep buffering
          if (!lowerBuffer.includes(DOMTokenParser.THINK_END)) {
            // Only keep characters after the start tag
            if (startIndex > 0) {
              this.appendContent(this.tokenBuffer.slice(0, startIndex));
              this.tokenBuffer = this.tokenBuffer.slice(startIndex);
            }
            return; // Wait for more tokens
          }

          const endIndex = lowerBuffer.indexOf(DOMTokenParser.THINK_END);
          const contentBetweenTags = this.tokenBuffer.slice(
            startIndex + DOMTokenParser.THINK_START.length,
            endIndex
          );

          // If we have content between tags, start thinking mode
          if (contentBetweenTags.trim().length > 0) {
            this.startThinking();
            // Remove everything up to the content after start tag
            this.tokenBuffer = this.tokenBuffer.slice(startIndex + DOMTokenParser.THINK_START.length);
          } else {
            // No content, strip both tags
            const beforeTags = this.tokenBuffer.slice(0, startIndex);
            const afterTags = this.tokenBuffer.slice(endIndex + DOMTokenParser.THINK_END.length);
            this.tokenBuffer = beforeTags + afterTags;
          }
          continue;
        }

        // Handle think end when we're in thinking mode
        if (this.isThinking && lowerBuffer.includes(DOMTokenParser.THINK_END)) {
          const endIndex = lowerBuffer.indexOf(DOMTokenParser.THINK_END);
          // Process remaining thinking content
          if (endIndex > 0) {
            this.thinkingBuffer += this.tokenBuffer.slice(0, endIndex);
            this.renderThinking();
          }
          this.endThinking();
          this.tokenBuffer = this.tokenBuffer.slice(endIndex + DOMTokenParser.THINK_END.length);
          continue;
        }

        // Process regular content character by character
        if (this.isThinking) {
          this.thinkingBuffer += this.tokenBuffer[0];
          this.renderThinking();
        } else {
          this.appendContent(this.tokenBuffer[0]);
        }
        this.tokenBuffer = this.tokenBuffer.slice(1);
      }
    } catch (error) {
      console.error('Error processing token:', error);
      this.tokenBuffer = '';
    }
  }

  private startThinking() {
    console.log('Starting thinking mode', {
      currentBuffer: this.tokenBuffer,
      thinkingState: this.isThinking
    });

    if (!this.isThinking) {
      console.log('Starting thinking mode');
      this.isThinking = true;
      this.thinkingBuffer = '';
      if (this.thinkingElement) {
        this.thinkingElement.style.display = 'block';
        console.log('Thinking element displayed:', this.thinkingElement);
      } else {
        console.error('Thinking element not found');
      }
    }
  }

  private endThinking() {
    if (this.isThinking) {
      console.log('Ending thinking mode');
      this.isThinking = false;
      this.thinkingContent = this.thinkingBuffer;
      this.renderThinking();
    }
  }

  private appendContent(token: string) {
    try {
      if (this.isThinking) {
        this.renderThinking();
      } else {
        this.currentText += token;
        this.renderResponse();
      }
    } catch (error) {
      console.error('Error appending content:', error);
    }
  }

  private renderThinking() {
    if (!this.thinkingElement) {
      console.error('Thinking element is null');
      return;
    }

    try {
      // Get the specific thinking content div inside the accordion
      const contentDiv = this.thinkingElement.querySelector('[data-testid="thinking-content"]');
      console.log('Rendering thinking:', {
        isThinking: this.isThinking,
        thinkingBuffer: this.thinkingBuffer,
        thinkingContent: this.thinkingContent,
        contentDiv: contentDiv,
        display: this.thinkingElement.style.display
      });

      if (contentDiv) {
        contentDiv.textContent = this.isThinking ? this.thinkingBuffer : this.thinkingContent;
      }
    } catch (error) {
      console.error('Error rendering thinking content:', error);
    }
  }

  private renderResponse() {
    if (!this.responseElement) return;

    try {
      const responseTextContainer = this.responseElement.querySelector('.response-text');
      if (responseTextContainer) {
        responseTextContainer.textContent = this.currentText;
      }
    } catch (error) {
      console.error('Error rendering response:', error);
    }
  }

  public clear() {
    this.currentText = '';
    this.thinkingContent = '';
    this.thinkingBuffer = '';
    this.isThinking = false;
    this.tokenBuffer = '';

    if (this.thinkingElement) {
      this.thinkingElement.style.display = 'none';
      const contentDiv = this.thinkingElement.querySelector('[data-testid="thinking-content"]');
      if (contentDiv) {
        contentDiv.textContent = '';
      }
    }

    if (this.responseElement) {
      const responseTextContainer = this.responseElement.querySelector('.response-text');
      if (responseTextContainer) {
        responseTextContainer.textContent = '';
      }
    }
  }

  public getText(): string {
    return this.currentText;
  }

  public getThinkingContent(): string {
    return this.thinkingContent;
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  public static createMessageContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'message-content';
    container.style.wordBreak = 'break-word';
    return container;
  }

  public static create(): { parser: DOMTokenParser; container: HTMLElement } {
    const container = this.createMessageContainer();
    const parser = new DOMTokenParser(container);
    return { parser, container };
  }
}