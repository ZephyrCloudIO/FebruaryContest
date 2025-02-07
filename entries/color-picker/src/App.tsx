import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

function App() {
    let canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [currentColor, setCurrentColor] = useState<string>('');
    useLayoutEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) initColorPicker(canvas, setCurrentColor);
    }, [setCurrentColor]);

    useEffect(() => {
        window.addEventListener('resize', () => {
            const canvas = canvasRef.current;
            if (canvas) {
                initColorPicker(canvas, setCurrentColor);
            }
        });
    }, [setCurrentColor]);
    return (
        <div className=" bg-black w-screen h-screen">
            {canvasRef.current && (
                <MagnifyingGlass
                    curentColor={currentColor}
                    mainCanvas={canvasRef.current!}
                />
            )}
            <canvas
                ref={canvasRef}
                className="color-canvas cursor-none"
                onClick={() => {
                    if (!currentColor) return;

                    navigator.clipboard
                        .writeText(`#${currentColor}`)
                        .catch(function (err) {
                            console.error('Async: Could not copy text: ', err);
                        });
                }}
            ></canvas>
        </div>
    );
}

export default App;

const magSize = 126;
const halfMagSize = magSize / 2;
function MagnifyingGlass(props: {
    curentColor: string;
    mainCanvas: HTMLCanvasElement;
}) {
    let canvasRef = useRef<{
        element: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
    } | null>(null);
    let [xy, setxy] = useState([0, 0]);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.ctx.drawImage(
                props.mainCanvas,
                e.x - halfMagSize / 2,
                e.y - halfMagSize / 2,
                200,
                100,
                0,
                0,
                400,
                200
            );
            setxy([e.clientX, e.clientY]);
        };
        window.addEventListener('mousemove', onMouseMove);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    });

    useLayoutEffect(() => {
        const canvas = canvasRef.current?.element;

        if (canvas) initColorPicker(canvas);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', () => {
            const canvas = canvasRef.current?.element;
            if (canvas) {
                initColorPicker(canvas);
            }
        });
    });

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                top: xy[1] - halfMagSize,
                left: xy[0] - halfMagSize,
                height: magSize,
                width: magSize,
            }}
        >
            <div className=" shadow-2xs border-black/10 border opacity-75 absolute rounded-full overflow-hidden w-full h-full">
                <canvas
                    ref={(el) =>
                        (canvasRef.current = {
                            ctx: el?.getContext('2d')!,
                            element: el!,
                        })
                    }
                />
                <div className="font-bold absolute bottom-2 text-xs w-min mx-auto left-1/2 -translate-x-1/2  p-1 px-2 text-center font-mono">
                    #{props.curentColor}
                </div>
            </div>
        </div>
    );
}

function initColorPicker(
    canvas: HTMLCanvasElement,
    setCurrentColor?: (val: string) => void
) {
    if (!canvas) return;
    const canvasContext = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: false,
    });
    if (!canvasContext) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let gradient = canvasContext.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1 / 6, '#ffff00');
    gradient.addColorStop((1 / 6) * 2, '#00ff00');
    gradient.addColorStop((1 / 6) * 3, '#00ffff');
    gradient.addColorStop((1 / 6) * 4, '#0000ff');
    gradient.addColorStop((1 / 6) * 5, '#ff00ff');
    gradient.addColorStop(1, '#ff0000');
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    gradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    gradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    canvas.onmousemove = function (e) {
        console.log();
        var imgData = canvasContext.getImageData(
            (e.offsetX / canvas.clientWidth) * canvas.width,
            (e.offsetY / canvas.clientHeight) * canvas.height,
            1,
            1
        );

        let d = imgData.data;
        setCurrentColor?.(toHex(d[0]) + toHex(d[1]) + toHex(d[2]));
    };
}

function toHex(color: number) {
    let hex = color.toString(16).toUpperCase();
    if (hex.length === 1) hex = `0${hex}`;
    return hex;
}
