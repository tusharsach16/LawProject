export interface Message {
    _id?: string;
    text: string;
    senderId: string;
    timestamp: string;
}

interface MessageBubbleProps {
    message: Message;
    isSender: boolean;
}

const MessageBubble = ({ message, isSender }: MessageBubbleProps) => {
    if (message.senderId === 'system') {
        return (
            <div className="flex justify-center my-4 animate-fade-in">
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {message.text}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${
                isSender 
                ? 'bg-slate-900 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-[10px] mt-1 text-right ${
                    isSender ? 'text-slate-400' : 'text-slate-400'
                }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
