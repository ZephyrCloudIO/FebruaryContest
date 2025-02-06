export class MessageHydrator {
    private container: HTMLElement;
    private thinkingElement: HTMLElement | null = null;
    private thinkingContent: HTMLElement | null = null;
    private responseElement: HTMLElement | null = null;
    private tokenBuffer: string = '';
    private isThinking: boolean = false;

    private static readonly THINK_START = '<think>';
    private static readonly THINK_END = '</think>';

    constructor(container: HTMLElement, private readonly fromUser = false) {
        this.container = container;
        this.initializeElements();
    }

    private initializeElements() {
        this.container.innerHTML = ``;

        const content = `
    <div class="flex justify-start">  
        <div class="mt-4 transition-all duration-200 ease-in-out rounded-2xl shadow-sm p-4 border border-gray-100 text-gray-900 mr-4 transform-gpu ${this.fromUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'}">
            <div data-testid="thinking-section" style="display: none;">        
                <button class="relative w-full text-left rounded-lg bg-white px-4 py-2 font-medium hover:bg-gray-50 focus:outline-none flex items-center gap-2 group overflow-hidden before:absolute before:inset-0 before:animate-gradient before:bg-gradient-to-r before:from-blue-400 before:via-blue-500 before:to-blue-600 before:bg-[length:200%_100%] before:p-[1px] before:-m-[1px] before:rounded-lg" 
                    onclick="this.nextElementSibling.classList.toggle('hidden'); 
                            this.querySelector('.chevron-right')?.classList.toggle('hidden');
                            this.querySelector('.chevron-down')?.classList.toggle('hidden');
                            this.classList.toggle('rounded-b-none')"
                >
                    <span class="relative z-10 w-full h-full rounded-lg flex items-center gap-2">
                        <svg class="chevron-right w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <svg class="chevron-down w-4 h-4 hidden text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-white">Thinking Process</span>
                    </span>
                </button>
                <div class="hidden border-x border-b border-gray-100 rounded-b-lg bg-white">
                    <div class="px-4 py-2 text-sm text-gray-600" data-testid="thinking-content"></div>
                </div>
            </div>
            <div data-testid="response-content"></div>
        </div>
    </div>
`;

        this.container.insertAdjacentHTML('beforeend', content);

        this.thinkingElement = this.container.querySelector('[data-testid="thinking-content"]');
        this.thinkingContent = this.container.querySelector('[data-testid="thinking-section"]');
        this.responseElement = this.container.querySelector('[data-testid="response-content"]');

        if (!this.thinkingElement || !this.responseElement) {
            throw new Error('Failed to initialize DOM elements');
        }
    }

    public appendToken(token: string, updateUi = true) {
        if (!token) return;

        this.tokenBuffer += token;

        if (updateUi) {
            this.processTokens();
        }
    }

    private processTokens() {
        try {
            const startIndex = this.tokenBuffer.indexOf(MessageHydrator.THINK_START);
            const endIndex = this.tokenBuffer.indexOf(MessageHydrator.THINK_END);

            if (startIndex === -1) {
                this.updateContent(this.responseElement!, this.tokenBuffer);
                return;
            }

            if (endIndex === -1) {
                const strippedBuffer = this.tokenBuffer.substring(0, startIndex) +
                    this.tokenBuffer.substring(startIndex + MessageHydrator.THINK_START.length).trim();

                if (strippedBuffer) {
                    this.isThinking = true;
                    this.showThinkingElement();
                }
                this.updateContent(this.thinkingElement!, strippedBuffer);
                return;
            }

            if (this.isThinking) {
                this.isThinking = false;
                const thinkContent = this.tokenBuffer.slice(
                    startIndex + MessageHydrator.THINK_START.length,
                    endIndex
                );
                this.updateContent(this.thinkingElement!, thinkContent);
            }

            const content = this.tokenBuffer.slice(endIndex + MessageHydrator.THINK_END.length);
            this.updateContent(this.responseElement!, content);
        } catch (error) {
            console.error('Error processing tokens:', error);
            this.tokenBuffer = '';
        }
    }

    private showThinkingElement() {
        if (this.thinkingContent?.style.display === 'none') {
            this.thinkingContent.style.display = 'block';
        }
    }

    private updateContent(element: HTMLElement, content: string) {
        if (!element) return;

        // Direct DOM update for real-time streaming
        if (element.textContent !== content) {
            element.textContent = content;
        }
    }

    getAndClearBuffer() {
        const buffer = this.tokenBuffer;
        this.tokenBuffer = '';
        return buffer;
    }
}