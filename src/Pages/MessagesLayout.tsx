import { useChatStore } from "../store/chatStore";
import { useEffect, useState, useRef } from "react";
import  useAuthStore  from "../store/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, Send, Search, MessageSquare, Hand, Loader2, FileText, Upload, X, Image } from "lucide-react";
import type { Conversation } from "../@types/conversation";
import echo from "../lib/echo";

const ConversationsSkeleton = () => (
    <div className="flex flex-col gap-2 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-muted shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

const MessagesSkeleton = () => (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => {
            const isMyMessage = i % 2 === 0;
            return (
                <div key={i} className={`flex gap-3 max-w-[85%] md:max-w-[70%] animate-pulse ${isMyMessage ? 'self-end flex-row-reverse' : 'self-start'}`}>
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0 mt-auto"></div>
                    <div className={`flex flex-col gap-1 ${isMyMessage ? 'items-end' : 'items-start'}`}>
                        <div className={`h-10 bg-muted rounded-2xl w-32 ${isMyMessage ? 'rounded-br-sm' : 'rounded-bl-sm'}`}></div>
                    </div>
                </div>
            );
        })}
    </div>
);

const MessagesLayout=()=>{
    const {
        conversations,
        isGettingConversations,
        getConversations,
        activeConversation,
        setActiveConversation,
        isGettingMessages,
        messages,
        getMessages,
        isSendingMessage,
        sendMessage
    }=useChatStore();
    const {authUser}=useAuthStore();
    const [messageInput,setMessageInput]=useState('');
    const [file,setFile]=useState<File|null>(null);
    const [errorInp,setErrorInp]=useState('');
    const [pendingMessageText, setPendingMessageText]=useState('');
    const [pendingImage,setPendingImage]=useState<boolean>(false);
    const [pendingFile,setPendingFile]=useState<boolean>(false);
    const [search,setSearch]=useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const uploadRef=useRef<HTMLInputElement>(null);

    useEffect(()=>{
        if(conversations?.length === 0){
            getConversations();
        }
    },[]);

    const filteredConversation=conversations.filter((conversation)=>{
        return conversation.participants.some((p)=>p.user?.name?.toLowerCase()?.includes(search.toLowerCase()));
    });
    
    // Laravel Echo Real-Time Listeners
    useEffect(() => {
        if (!activeConversation) return;

        const channelName = `conversation.${activeConversation.id}`;
        
        const channel = echo.private(channelName)
            .listen('.message.sent', (event: any) => {
                const incomingMessage = event.message;
                
                useChatStore.setState((state) => {
                    // Check if message already exists 
                    const messageExists = state.messages.some(m => String(m.id) === String(incomingMessage.id));
                    if (messageExists) return state;
                    
                    return { messages: [...state.messages, incomingMessage] };
                });
                
                // Update the sidebar last message locally without an API call
                useChatStore.setState((state) => {
                    const updatedConversations = state.conversations.map(conv => {
                        if (conv.id == incomingMessage.conversation_id) {
                            return { ...conv, last_message: incomingMessage, updated_at: new Date().toISOString() };
                        }
                        return conv;
                    });
                    
                    // Sort conversations by updated_at descending
                    updatedConversations.sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime());
                    
                    return { conversations: updatedConversations };
                });
            });

        return () => {
            echo.leave(channelName);
        };
    }, [activeConversation]);

    // Auto-scroll on new messages or when sending
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSendingMessage]);

    const handleSendMessage=async()=>{
        if(!messageInput.trim() && !file){
            setErrorInp('Message is required');
            return;
        }
        setErrorInp('');
        const contentToSend = messageInput;
        setPendingMessageText(contentToSend);
        setMessageInput('');
        let type="text";
        if(file){
            type = file.type.startsWith("image/") ? "image" : "file";
        }

        if(type=="image"){
            setPendingImage(true);
        }
        else if(type=="file"){
            setPendingFile(true);
        }
        
        const receiverId = activeConversation?.participants?.find((p)=>p.user_id !== authUser?.id)?.user_id;
        
        setFile(null);
        
        if (receiverId) {
            await sendMessage(
                receiverId,
                type,
                contentToSend,
                file,
                file?.name
            );
        }

        setPendingMessageText('');
        setPendingImage(false);
        setPendingFile(false);
    }
    const handleFileChange=(event:React.ChangeEvent<HTMLInputElement>)=>{
        const file=event.target.files?.[0];
        if(file){
            setFile(file);
        }
    }
    const handleSelectConversation=async(conversation:Conversation)=>{
        setActiveConversation(conversation);
        await getMessages(conversation.id);
    }

    return (
        <div className="flex-1 flex flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden bg-background">
            {/* conversations sidebar */}
            <div className={`w-full md:w-[35%] lg:w-[25%] border-r border-border bg-card h-full flex-col transition-all duration-300 ease-in-out ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-border space-y-4">
                    <h2 className="font-bold text-2xl tracking-tight">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search conversations..." 
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            className="pl-9 bg-muted/50 border-none rounded-xl"
                        />
                    </div>
                </div>
                
                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
                    {isGettingConversations ? (
                        <ConversationsSkeleton />
                    ) : (
                        filteredConversation.map((conversation)=>{
                            const isDirect = conversation.type === 'direct';
                            const otherParticipant = isDirect ? conversation.participants?.find((p)=>p.user_id !== authUser?.id) : null;
                            const isActive = activeConversation?.id === conversation.id;
                            
                            return(
                                <div 
                                    key={conversation.id} 
                                    onClick={() => handleSelectConversation(conversation)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                                        isActive ? 'bg-primary text-primary-foreground shadow-md pointer-events-none' : 'hover:bg-muted/60'
                                    }`}
                                >
                                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                        <AvatarImage src={isDirect ? otherParticipant?.user?.avatar_url : undefined} />
                                        <AvatarFallback className={isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'}>
                                            {isDirect ? otherParticipant?.user?.name?.charAt(0) : conversation.group_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-primary-foreground' : ''}`}>
                                                {isDirect ? otherParticipant?.user?.name : conversation.group_name}
                                            </h3>
                                        </div>
                                        <p className={`text-sm truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                            {isDirect && otherParticipant?.user?.role === 'teacher' ? 'Teacher' : 'Student'} 
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    {filteredConversation.length === 0 && !isGettingConversations && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">No conversations found</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* messages area */}
            <div className={`flex-1 h-full bg-background/50 ${activeConversation ? 'flex flex-col' : 'hidden md:flex md:items-center md:justify-center'}`}>
                {
                    activeConversation == null ? (
                        <div className="flex flex-col justify-center items-center text-center p-8 max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <span className="text-4xl">
                                    <Hand></Hand>
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Your Messages</h3>
                            <p className="text-muted-foreground">Select a conversation from the sidebar to start chatting or view previous messages.</p>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col shadow-inner bg-card md:m-4 md:rounded-3xl md:border md:border-border overflow-hidden animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-300">
                            {/* header */}
                            <div className="px-4 py-3 border-b border-border flex items-center gap-4 bg-card/80 backdrop-blur-xl shadow-sm">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="md:hidden shrink-0"
                                    onClick={() => setActiveConversation(null)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                
                                {(() => {
                                    const isDirect = activeConversation.type === 'direct';
                                    const otherParticipant = isDirect ? activeConversation.participants?.find((p)=>p.user_id !== authUser?.id) : null;
                                    
                                    return (
                                        <>
                                            <Avatar className="h-10 w-10 border shadow-sm">
                                                <AvatarImage src={isDirect ? otherParticipant?.user?.avatar_url : undefined} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {isDirect ? otherParticipant?.user?.name?.charAt(0) : activeConversation.group_name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="font-bold text-base truncate">
                                                    {isDirect ? otherParticipant?.user?.name : activeConversation.group_name}
                                                </h2>
                                                <p className="text-xs text-green-500 font-medium">Online</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            
                            {/* messages area (scrollable) */}
                            {isGettingMessages ? (
                                <MessagesSkeleton />
                            ) : (
                                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-muted/10 relative">
                                    {messages.length === 0 && !isSendingMessage ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
                                            <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mb-4 shadow-sm">
                                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <p className="font-medium text-lg">No messages here</p>
                                            <p className="text-muted-foreground text-sm mt-1">Send a message to start the conversation.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((message,index)=>{
                                                const isMyMessage = message.sender_id === authUser?.id;
                                                return(
                                                    <div 
                                                        key={`${message.id}-${index}`}
                                                        className={`flex gap-3 max-w-[85%] md:max-w-[70%] animate-in slide-in-from-bottom-2 duration-300 ${isMyMessage ? 'self-end flex-row-reverse' : 'self-start'}`}
                                                    >
                                                        <Avatar className="h-8 w-8 mt-auto shrink-0 shadow-sm border border-background">
                                                            <AvatarFallback className={isMyMessage ? "bg-primary/20 text-primary text-xs" : "bg-card border border-border text-xs"}>
                                                                {isMyMessage ? "You" : message.sender?.name?.charAt(0) ?? "U"}
                                                            </AvatarFallback>
                                                            <AvatarImage src={message.sender?.avatar_url}/>
                                                        </Avatar>
                                                        <div className={`flex flex-col gap-1 ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                            <div className={`${message.file_url?'flex':'hidden'}`}>
                                                                {/* image */}
                                                                {message.type==='image' && (
                                                                    <a
                                                                        href={message.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block w-40 h-40 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                                                                    >
                                                                        <img
                                                                            src={message.file_url}
                                                                            alt="sent image"
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).src = '/fallback-image.png';
                                                                            }}
                                                                        />
                                                                    </a>
                                                                )}
                                                                {/* pdf doc */}
                                                                {message.type==='file' && (
                                                                    <a
                                                                        href={message.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                                                    >
                                                                        <FileText className="h-5 w-5" />
                                                                        <span className="text-sm font-medium truncate max-w-32">
                                                                            {'Document'}
                                                                        </span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                            {message.content &&(
                                                                <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed 
                                                                                    ${isMyMessage 
                                                                                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                                                                                        : 'bg-card text-card-foreground border border-border/50 rounded-bl-sm'}
                                                                                `}
                                                                >
                                                                    {message.content}
                                                                </div>
                                                            )}
                                                            <span className={`text-[10px] font-medium text-muted-foreground/80 ${isMyMessage ? 'mr-1' : 'ml-1'}`}>
                                                                {new Date(message.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Optimistic "Sending..." Message Bubble */}
                                            {isSendingMessage && pendingMessageText && !pendingImage && !pendingFile && (
                                                <div className="flex gap-3 max-w-[85%] md:max-w-[70%] self-end flex-row-reverse animate-in fade-in duration-300 opacity-60">
                                                    <Avatar className="h-8 w-8 mt-auto shrink-0 shadow-sm border border-background">
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                            You
                                                        </AvatarFallback>
                                                        <AvatarImage src={authUser?.avatar_url}/>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <div className="px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-primary text-primary-foreground rounded-br-sm">
                                                            {pendingMessageText}
                                                        </div>
                                                        <span className="text-[10px] font-medium text-muted-foreground/80 mr-1 flex items-center gap-1">
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Sending...
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Show pending image message if uploading */}
                                            {pendingImage && !pendingMessageText && !pendingFile && isSendingMessage && (
                                                <div className="flex gap-3 max-w-[85%] md:max-w-[70%] self-end flex-row-reverse animate-in fade-in duration-300 opacity-60">
                                                    <Avatar className="h-8 w-8 mt-auto shrink-0 shadow-sm border border-background">
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                            You
                                                        </AvatarFallback>
                                                        <AvatarImage src={authUser?.avatar_url}/>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <div className="px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-primary text-primary-foreground rounded-br-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Image size={16} />
                                                                {file?.name || "Uploading image..."}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-medium text-muted-foreground/80 mr-1 flex items-center gap-1">
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Uploading...
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* show pending message if text and image */}
                                            {pendingMessageText && isSendingMessage && pendingImage && !pendingFile && (
                                                <div className="flex gap-3 max-w-[85%] md:max-w-[70%] self-end flex-row-reverse animate-in fade-in duration-300 opacity-60">
                                                    <Avatar className="h-8 w-8 mt-auto shrink-0 shadow-sm border border-background">
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                            You
                                                        </AvatarFallback>
                                                        <AvatarImage src={authUser?.avatar_url}/>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <div className="px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-primary text-primary-foreground rounded-br-sm flex items-center gap-2">
                                                            <Image size={16} />
                                                            {file?.name || "Uploading image..."}
                                                        </div>
                                                        <div className="px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-primary text-primary-foreground rounded-br-sm">
                                                            {pendingMessageText}
                                                        </div>
                                                        <span className="text-[10px] font-medium text-muted-foreground/80 mr-1 flex items-center gap-1">
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Sending...
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show pending file message if uploading */}
                                            {pendingFile && !pendingMessageText && !pendingImage && isSendingMessage && (
                                                <div className="flex gap-3 max-w-[85%] md:max-w-[70%] self-end flex-row-reverse animate-in fade-in duration-300 opacity-60">
                                                    <Avatar className="h-8 w-8 mt-auto shrink-0 shadow-sm border border-background">
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                            You
                                                        </AvatarFallback>
                                                        <AvatarImage src={authUser?.avatar_url}/>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <div className="px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-primary text-primary-foreground rounded-br-sm flex items-center gap-2">
                                                            <FileText size={16} />
                                                            {file?.name || "Uploading file..."}
                                                        </div>
                                                        <span className="text-[10px] font-medium text-muted-foreground/80 mr-1 flex items-center gap-1">
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Uploading...
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* show pending message if text and file */}
                                            {pendingMessageText && !pendingImage && pendingFile && isSendingMessage && (
                                                <div className="flex gap-3 max-w-[85%] md:max-w-[70%] self-end flex-row-reverse animate-in fade-in duration-300 opacity-60">
                                                    <Avatar className="h-8 w-8 mt-auto shrink-0 shadow-sm border border-background">
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                            You
                                                        </AvatarFallback>
                                                        <AvatarImage src={authUser?.avatar_url}/>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <div className="px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-primary text-primary-foreground rounded-br-sm flex items-center gap-2">
                                                            <FileText size={16} />
                                                            {file?.name || "Uploading file..."}
                                                        </div>
                                                        <div className="px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-primary text-primary-foreground rounded-br-sm">
                                                            {pendingMessageText}
                                                        </div>
                                                        <span className="text-[10px] font-medium text-muted-foreground/80 mr-1 flex items-center gap-1">
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Sending...
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Auto-scroll anchor */}
                                            <div ref={messagesEndRef} className="h-1" />
                                        </>
                                    )}
                                </div>
                            )}
                            
                            {/* message input area */}
                            <div className="p-4 bg-card border-t border-border mt-auto">
                                {/* show selected file */}
                                {file && (
                                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-2xl mb-2">
                                        <div className="flex flex-col gap-1">
                                            {file.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    className="w-40 h-40 object-cover rounded" 
                                                />
                                            ) : (
                                                <div className="w-fit h-10 p-2 object-cover rounded flex items-center justify-center border border-border">
                                                    <span className="text-sm text-muted-foreground">{file?.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button 
                                            onClick={()=>{setFile(null);}}
                                            disabled={isSendingMessage}
                                            size="icon" 
                                            className="h-8 w-8 rounded-full shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex items-end gap-2 bg-muted/50 p-2 rounded-3xl border border-transparent focus-within:border-primary/30 focus-within:bg-card transition-all shadow-inner">
                                    <Input
                                        placeholder="Type your message..."
                                        aria-invalid={errorInp!==''}
                                        disabled={isSendingMessage}
                                        onKeyDown={(e)=>{
                                            if(e.key==='Enter' && !isSendingMessage){
                                                handleSendMessage();
                                            }
                                        }}
                                        value={messageInput}
                                        onChange={(e)=>setMessageInput(e.target.value)}
                                        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 shadow-none disabled:opacity-50"
                                    />

                                    {/* upload btn */}
                                    <Button 
                                        onClick={()=>{uploadRef.current?.click();}}
                                        disabled={isSendingMessage}
                                        size="icon" 
                                        className="h-10 w-10 rounded-full shrink-0 shadow-md transition-transform hover:scale-105"
                                    >
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                    <input type="file" ref={uploadRef} className="hidden" onChange={(e)=>handleFileChange(e)} />
                                    
                                    {/* send btn */}
                                    <Button 
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() && !file || isSendingMessage}
                                        size="icon" 
                                        className="h-10 w-10 rounded-full shrink-0 shadow-md transition-transform hover:scale-105"
                                    >
                                        <Send className="h-4 w-4 ml-1" />
                                    </Button>

                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default MessagesLayout;