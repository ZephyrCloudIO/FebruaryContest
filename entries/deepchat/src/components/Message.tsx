import { useEffect, useRef } from "react";
import { MessageHydrator } from "../services/MessageHydrator";

const Message: React.FC<{ id: string; content: string, isUser: boolean }> = ({ id, content, isUser }) => {
    const messageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messageRef.current) {
            const hydrator = new MessageHydrator(messageRef.current, isUser);
            hydrator.appendToken(content);
        }
    }, [content]);

    return <div data-testid={id} ref={messageRef} />;
}

export { Message }