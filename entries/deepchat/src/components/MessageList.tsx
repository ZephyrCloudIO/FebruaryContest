import React, { PropsWithChildren } from 'react';
import { Message } from "../contexts/ThreadContext";
import { Message as ChatMessage } from "./Message";

const MessageList: React.FC<{ messages: Message[] } & PropsWithChildren> = ({ messages, children }) => {
    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <ChatMessage id={message.id} content={message.content} isUser={message.role === 'user'} />
                </div>
            ))}
            {children}
        </div>
    );
};

export { MessageList };