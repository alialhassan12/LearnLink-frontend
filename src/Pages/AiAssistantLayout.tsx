import { useEffect, useState, useRef } from "react";
import { useAiChatStore } from "../store/aiChatStore";
import { useAiMessagesStore } from "../store/aiMessagesStore";
import useAuthStore from "../store/authStore";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import {
    Sparkles, 
    Send, 
    Plus, 
    Copy, 
    Check, 
    Compass, 
    HelpCircle, 
    Lightbulb, 
    PenTool, 
    Loader2, 
    Menu, 
    MessageSquare,
    AlertTriangle,
    Paperclip,
    X,
    File as FileIcon,
} from "lucide-react";

// Sub-component for code blocks with copy-to-clipboard functionality
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div className="my-4 rounded-xl border border-border/80 overflow-hidden bg-zinc-950 font-mono text-xs md:text-sm text-zinc-100 shadow-md">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-sans">
            <span className="font-semibold uppercase tracking-wider text-[10px]">{language}</span>
            <button 
            id={`copy-code-btn-${language}`}
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors text-xs font-medium cursor-pointer"
            >
            {copied ? (
                <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">Copied!</span>
                </>
            ) : (
                <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy code</span>
                </>
            )}
            </button>
        </div>
        <div className="p-4 overflow-x-auto">
            <pre><code className="block select-text whitespace-pre">{code}</code></pre>
        </div>
        </div>
    );
};

// Text parser helper for rendering lists, inline formatting (bold, inline code), and paragraphs
const parseInlineFormatting = (text: string) => {
    const tokenRegex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-text-strong">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
        return (
            <code key={idx} className="bg-muted px-1.5 py-0.5 rounded text-xs md:text-sm font-mono text-primary border border-border/50">
            {part.slice(1, -1)}
            </code>
        );
        }
        return part;
    });
};

const parseTextWithInlineElements = (text: string) => {
    const lines = text.split('\n');
    let inList = false;
    const listItems: React.ReactNode[] = [];
    const renderedElements: React.ReactNode[] = [];

    const flushList = (key: number) => {
        if (listItems.length > 0) {
        renderedElements.push(
            <ul key={`ul-${key}`} className="list-disc pl-6 my-2 space-y-1 text-sm md:text-base text-text-strong/90">
            {[...listItems]}
            </ul>
        );
        listItems.length = 0;
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(
            <li key={index} className="leading-relaxed">
            {parseInlineFormatting(trimmed.slice(2))}
            </li>
        );
        } else {
        if (inList) {
            flushList(index);
            inList = false;
        }
        if (trimmed !== '') {
            renderedElements.push(
            <p key={index} className="leading-relaxed my-1">
                {parseInlineFormatting(line)}
            </p>
            );
        } else {
            renderedElements.push(<div key={index} className="h-2" />);
        }
        }
    });

    if (inList) {
        flushList(lines.length);
    }

    return renderedElements;
};

const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
        const codeLines = part.slice(3, -3).trim().split('\n');
        let language = 'code';
        let code = part.slice(3, -3).trim();

        const firstLine = codeLines[0].trim();
        const isLang = /^[a-zA-Z0-9+#-]+$/.test(firstLine);
        if (isLang) {
            language = firstLine;
            code = codeLines.slice(1).join('\n');
        }

        return <CodeBlock key={index} code={code} language={language} />;
        }

        return (
        <div key={index} className="space-y-1 text-sm md:text-base text-text-strong/95 leading-relaxed">
            {parseTextWithInlineElements(part)}
        </div>
        );
    });
};

// Main Component
const AiAssistantLayout = () => {
    const { aiChats, getAiChats, isGettingAiChats,setAiChats } = useAiChatStore();
    const { 
        aiMessages, 
        getAiMessages, 
        isGettingAiMessages, 
        sendMessageToAi, 
        isReceivingAiMessage ,
        addMessage,
        sendMessageWithFileToAi
    } = useAiMessagesStore();
    const { authUser } = useAuthStore();

    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [input, setInput] = useState("");
    const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedFile,setSelectedFile]=useState<File|null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInpRef = useRef<HTMLInputElement>(null);

    // Fetch all chats on load
    useEffect(() => {
        getAiChats();
    }, [getAiChats]);

    // Fetch messages when selected chat changes
    useEffect(() => {
        if (selectedChatId !== null) {
            getAiMessages(selectedChatId);
        }
        setErrorMessage(null);
    }, [selectedChatId, getAiMessages]);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [pendingPrompt, isReceivingAiMessage]);

    // Adjust input textarea height dynamically
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [input]);

    // Date grouping helper
    const getGroupedChats = (chats: typeof aiChats) => {
        const groups: { [key: string]: typeof aiChats } = {
            "Today": [],
            "Yesterday": [],
            "Previous Days": []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        chats.forEach(chat => {
        const chatDate = new Date(chat.created_at);
        chatDate.setHours(0, 0, 0, 0);

        if (chatDate.getTime() === today.getTime()) {
            groups["Today"].push(chat);
        } else if (chatDate.getTime() === yesterday.getTime()) {
            groups["Yesterday"].push(chat);
        } else {
            groups["Previous Days"].push(chat);
        }
        });

        return groups;
    };

    const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files[0];
        if(file){
            setSelectedFile(file);
        }
    }

    const handleNewChat = () => {
        setSelectedChatId(null);
        setErrorMessage(null);
        setMobileOpen(false);
        setInput("");
        useAiMessagesStore.setState({ aiMessages: [] });
    };

    const handleSend = async (customPrompt?: string) => {
        if(!selectedFile){
            const promptToSend = (customPrompt || input).trim();
            if (!promptToSend || isReceivingAiMessage) return;

            setInput("");
            setPendingPrompt(promptToSend);
            setErrorMessage(null);

            addMessage({
                id: -1,
                ai_chat_id: selectedChatId || -1,
                role: "user",
                type:"text",
                content: promptToSend,
                tokens_used:0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            try {
                if (selectedChatId === null) {
                    // Create new chat
                    const title = promptToSend.split(" ").slice(0, 4).join(" ") || "New Chat";
                    const result = await sendMessageToAi(null, promptToSend, title);
                    
                    if (result?.chat?.id) {
                        setAiChats(result.chat);
                        setSelectedChatId(result.chat.id);
                    }
                } else {
                    // Continue chat
                    const result=await sendMessageToAi(selectedChatId, promptToSend);
                    if(result?.ai_message){
                        // addMessage(result.ai_message);
                    }
                }
            } catch (err: any) {
                setErrorMessage(err?.response?.data?.message || "An error occurred while communicating with the AI. Please try again.");
            } finally {
                setPendingPrompt(null);
            }
        }else{
            const promptToSend = (customPrompt || input).trim();
            if (!promptToSend && !selectedFile || isReceivingAiMessage) return;
            addMessage({
                id:new Date().getTime(),
                ai_chat_id: selectedChatId || -1,
                role:"user",
                type:"file",
                content:promptToSend,
                tokens_used:0,
                file_name: selectedFile.name,
                file_path: selectedFile,
                file_type:selectedFile.type,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            setSelectedFile(null);
            setInput("");
            setPendingPrompt(promptToSend);
            setErrorMessage(null);
            try {
                if (selectedChatId === null) {
                    // Create new chat
                    const title = promptToSend.split(" ").slice(0, 4).join(" ") || "New Chat";
                    const result = await sendMessageWithFileToAi(null, promptToSend, selectedFile,title);
                    
                    if (result?.chat?.id) {
                        setAiChats(result.chat);
                        setSelectedChatId(result.chat.id);
                    }
                } else {
                    // Continue chat
                    const result=await sendMessageWithFileToAi(selectedChatId, promptToSend, selectedFile);
                    if(result?.ai_message){
                        // addMessage(result.ai_message);
                    }
                }
            } catch (err: any) {
                setErrorMessage(err?.response?.data?.message || "An error occurred while communicating with the AI. Please try again.");
            } finally {
                setPendingPrompt(null);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Clickable prompt templates
    const starterPrompts = [
        {
            title: "Explain React State",
            description: "How state works and why we need state stores",
            prompt: "Explain how state works in React and compare standard React context with Zustand stores.",
            icon: <Lightbulb className="h-5 w-5 text-amber-500" />
        },
        {
            title: "Create a Study Plan",
            description: "Outline a 4-week framework for learning",
            prompt: "I want to learn TypeScript and Tailwind CSS in 4 weeks. Please create a step-by-step weekly study plan with exercise goals.",
            icon: <Compass className="h-5 w-5 text-emerald-500" />
        },
        {
            title: "Analyze Code Performance",
            description: "Find issues in script logic",
            prompt: "Can you analyze the following code snippet and suggest potential performance improvements or memory optimization: \n\n```javascript\n// Paste code here\n```",
            icon: <HelpCircle className="h-5 w-5 text-indigo-500" />
        },
        {
            title: "Refine Professional Text",
            description: "Make an email or bio sound better",
            prompt: "Improve the professional quality and clarity of this text. Keep it direct and warm: \n\n\"[Paste your writing here]\"",
            icon: <PenTool className="h-5 w-5 text-rose-500" />
        }
    ];

    // Render Sidebar Content (Shared between desktop and mobile sheet drawer)
    const renderSidebar = () => {
        const grouped = getGroupedChats(aiChats);

        return (
            <div className="flex flex-col h-full bg-card/95 text-foreground">
                {/* Sidebar Header */}
                <div className="p-4 flex flex-col gap-2 shrink-0 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent flex items-center gap-1.5">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        LearnLink AI
                        </span>
                    </div>
                    
                    <Button 
                        id="ai-assistant-new-chat-button"
                        onClick={handleNewChat}
                        className="mt-2 w-full flex items-center justify-start gap-2 bg-gradient-to-r from-primary/10 to-indigo-500/10 hover:from-primary/20 hover:to-indigo-500/20 text-primary border border-primary/25 rounded-xl py-5 font-semibold transition-all duration-300 cursor-pointer"
                        variant="outline"
                    >
                        <Plus className="h-4 w-4" />
                        New Chat
                    </Button>
                </div>

                {/* Chats History List */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {isGettingAiChats ? (
                    <div className="space-y-3 p-1">
                    <Skeleton className="h-8 w-full rounded-lg" />
                    <Skeleton className="h-8 w-11/12 rounded-lg" />
                    <Skeleton className="h-8 w-4/5 rounded-lg" />
                    </div>
                ) : aiChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground/60 px-4">
                    <MessageSquare className="h-8 w-8 mb-2 text-muted-foreground/30" />
                    <p className="text-xs font-medium">No conversation history yet</p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([groupName, groupChats]) => {
                    if (groupChats.length === 0) return null;
                    return (
                        <div key={groupName} className="space-y-1.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-3">
                            {groupName}
                        </h4>
                        <div className="space-y-0.5">
                            {groupChats.map((chat) => {
                                const isActive = selectedChatId === chat.id;
                                return (
                                    <button
                                    key={chat.id}
                                    id={`chat-history-item-${chat.id}`}
                                    onClick={() => {
                                        setSelectedChatId(chat.id);
                                        setMobileOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 group cursor-pointer ${
                                        isActive 
                                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/15" 
                                        : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                                    }`}
                                    >
                                    <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground/70 group-hover:text-primary transition-colors"}`} />
                                    <span className="truncate flex-1">{chat.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                        </div>
                    );
                    })
                )}
                </div>

                {/* Sidebar User Footer */}
                <div className="p-4 border-t border-border/40 bg-muted/10 shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border shadow-sm">
                    <AvatarImage src={authUser?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {authUser?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{authUser?.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/80">{authUser?.role} Portal</p>
                    </div>
                </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden bg-background">
        
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-80 md:flex-col border-r border-border shrink-0 bg-card/40">
                {renderSidebar()}
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
                
                {/* Chat Window Header */}
                <header className="h-14 border-b border-border/60 flex items-center justify-between px-4 bg-background/85 backdrop-blur-md sticky top-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile Sidebar Trigger Sheet */}
                        <div className="md:hidden">
                            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                                <SheetTrigger asChild>
                                    <Button 
                                        id="ai-assistant-sidebar-toggle"
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 cursor-pointer"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-80 h-full border-r-0" >
                                    <SheetHeader>
                                        <SheetTitle></SheetTitle>
                                        <SheetDescription></SheetDescription>
                                    </SheetHeader>
                                    {renderSidebar()}
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" ></div>
                            <span className="font-semibold text-sm md:text-base">
                                {selectedChatId === null 
                                ? "New Conversation" 
                                : aiChats.find(c => c.id === selectedChatId)?.title || "AI Assistant"
                                }
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedChatId !== null && (
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={handleNewChat}
                                className="text-xs font-semibold hover:text-primary gap-1 px-2.5 rounded-lg cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">New Chat</span>
                            </Button>
                        )}
                    </div>
                </header>

                {/* Messages / Welcome Viewport */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 bg-muted/5">
                    {selectedChatId === null && aiMessages.length === 0 && !pendingPrompt ? (
                        
                        /* Welcoming Starter Page (Empty State) */
                        <div className="max-w-2xl mx-auto flex flex-col justify-center py-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
                            <div className="flex flex-col items-center text-center space-y-4 mb-10">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Sparkles className="h-7 w-7 text-white animate-pulse" />
                                </div>
                                <h1 id="ai-assistant-main-title" className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                                How can I help you learn today?
                                </h1>
                                <p className="text-muted-foreground text-sm max-w-md">
                                Ask me questions, prepare study schedules, brainstorm essays, or optimize code. Select a starter prompt below.
                                </p>
                            </div>

                            {/* Suggestions Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {starterPrompts.map((starter, i) => (
                                    <button
                                        key={i}
                                        id={`suggestion-card-${i + 1}`}
                                        onClick={() => {
                                            setInput(starter.prompt);
                                            if (textareaRef.current) {
                                            textareaRef.current.focus();
                                        }
                                    }}
                                        className="p-4 text-left rounded-2xl border border-border/80 bg-card hover:bg-muted/40 hover:border-primary/20 transition-all duration-300 group cursor-pointer shadow-xs"
                                    >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-muted rounded-xl shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {starter.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-foreground mb-0.5 group-hover:text-primary transition-colors">
                                            {starter.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">
                                                {starter.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    ) : (
                        
                        /* Message Feed */
                        <div className="max-w-3xl mx-auto space-y-6">
                            {/* Load state fallback */}
                            {isGettingAiMessages ? (
                                <div className="space-y-6">
                                    <div className="flex gap-3 max-w-[80%] self-start">
                                            
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-full rounded" />
                                            <Skeleton className="h-4 w-5/6 rounded" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 max-w-[80%] self-end flex-row-reverse">
                                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                        <div className="space-y-2 flex-1 items-end">
                                            <Skeleton className="h-4 w-32 rounded self-end" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {aiMessages.map((message) => {
                                        const isUser = message.role === "user";
                                        const messageType=message.type;
                                        let fileType="";
                                        if(messageType ==="file"){
                                            fileType=message.file_type;
                                        }
                                        
                                        return (
                                            <div 
                                                key={message.id}
                                                id={`message-${message.id}`}
                                                className={`flex gap-3 max-w-[85%] md:max-w-[78%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                                                    isUser ? "self-end ml-auto flex-row-reverse" : "self-start"
                                                }`}
                                            >
                                                {/* Avatar */}
                                                {isUser ? (
                                                    <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-background">
                                                        <AvatarImage src={authUser?.avatar_url} />
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                                                            {authUser?.name?.charAt(0).toUpperCase() || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-xs shrink-0 border border-primary/20">
                                                        <Sparkles className="h-4.5 w-4.5 text-white" />
                                                    </div>
                                                )}

                                                {/* Content Box */}
                                                {messageType=== "text" &&(
                                                    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                                                                    isUser 
                                                                    ? "bg-primary text-primary-foreground rounded-tr-xs" 
                                                                    : "bg-card text-card-foreground border border-border/60 rounded-tl-xs"
                                                                }`}
                                                        >
                                                            {renderMessageContent(message.content)}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground/60 px-1 mt-0.5">
                                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                )}
                                                {messageType=== "file" &&(
                                                    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                                                                    isUser 
                                                                    ? "bg-primary text-primary-foreground rounded-tr-xs" 
                                                                    : "bg-card text-card-foreground border border-border/60 rounded-tl-xs"
                                                                }`}
                                                        >
                                                            {fileType.startsWith("image/") ? (
                                                                <img 
                                                                    src={message.file_path instanceof File?URL.createObjectURL(message.file_path as File): message.file_path}
                                                                    alt={message.file_name}
                                                                    className="max-w-xs rounded-lg"
                                                                />
                                                            ) : (
                                                                <a 
                                                                    href={message.file_path instanceof File?URL.createObjectURL(message.file_path as File): message.file_path} 
                                                                    target="_blank" rel="noopener noreferrer" 
                                                                    className="flex items-center gap-2 hover:underline font-bold bg-card text-card-foreground border-border border-2 rounded-md p-2"
                                                                >
                                                                    <FileIcon className="h-4 w-4" />
                                                                    {message.file_name}
                                                                </a>
                                                            )}
                                                            <div className="mt-2">
                                                                {renderMessageContent(message?.content || "")}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground/60 px-1 mt-0.5">
                                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                        {/* Typing Response Loading Indicator */}
                        {isReceivingAiMessage && (
                            <div className="flex gap-3 max-w-[85%] md:max-w-[78%] self-start animate-in fade-in duration-300">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-xs shrink-0 border border-primary/20">
                                    <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
                                </div>
                                <div className="flex flex-col gap-1 items-start">
                                    <div className="px-4 py-3 bg-muted/40 rounded-2xl rounded-tl-xs border border-border/40 shadow-inner flex items-center gap-1.5 h-10">
                                        <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                            <div ref={messagesEndRef} className="h-2" />
                        </div>
                    )}
                </div>

                {/* Bottom Panel (Disclaimer + Capsule Input Box) */}
                <div className="p-4 border-t border-border bg-background z-10">
                    <div className="max-w-3xl mx-auto space-y-3">
                        
                        {/* Error Message Display Banner */}
                        {errorMessage && (
                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div className="flex-1 font-medium">{errorMessage}</div>
                                <button onClick={() => setErrorMessage(null)} className="text-destructive/70 hover:text-destructive hover:underline cursor-pointer">
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* file preview */}
                        {selectedFile &&(
                            <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    {selectedFile.type.startsWith("image/") ?(
                                        <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-20 h-20 rounded-lg" />
                                    ) :(
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                            <FileIcon className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                                        <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/20 hover:text-red-600 cursor-pointer" onClick={()=>setSelectedFile(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Input Capsule */}
                        <div className="relative flex items-end gap-2 bg-muted/50 p-2 rounded-2xl border border-border/70 focus-within:border-primary/50 focus-within:bg-card transition-all duration-300 shadow-inner">
                            
                            <Button
                                variant="default"
                                size="icon"
                                className="rounded-full hover:bg-primary bg-transparent text-text-strong hover:text-white cursor-pointer transition-all duration-200 hover:scale-105 rotate-[-45deg]"
                                onClick={()=>{
                                    if(fileInpRef.current){
                                        fileInpRef.current.click();
                                    }
                                }}
                            >
                                <Paperclip />
                            </Button>
                            <input 
                                type="file" 
                                ref={fileInpRef} 
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                                className="hidden" 
                                onChange={(e)=>handleFileChange(e)} 
                            />
                            
                            <textarea
                                id="ai-assistant-textarea"
                                ref={textareaRef}
                                rows={1}
                                placeholder="Message LearnLink AI..."
                                disabled={isReceivingAiMessage}
                                onKeyDown={handleKeyDown}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 max-h-[180px] min-h-[24px] bg-transparent resize-none border-0 outline-none ring-0 focus:ring-0 focus:outline-none px-3 py-1.5 text-sm md:text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70"
                            />

                            <Button
                                id="ai-assistant-send-button"
                                onClick={() => handleSend()}
                                disabled={!input.trim() && !selectedFile || isReceivingAiMessage}
                                size="icon"
                                className="h-9 w-9 rounded-xl shrink-0 shadow-md transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none"
                            >
                                {isReceivingAiMessage ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* ChatGPT-style small disclaimer */}
                        <p className="text-[10px] text-center text-muted-foreground/60 font-medium">
                            LearnLink AI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AiAssistantLayout;