import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Code, Eye, Download, Github, Zap, Moon, Sun, Menu, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import ChatSection from "@/components/ChatSection";
import CodeEditor from "@/components/CodeEditor";
import LivePreview from "@/components/LivePreview";
import DeployButton from "@/components/DeployButton";
import ChatManagement from "@/components/ChatManagement";
import LandingPage from "@/components/LandingPage";
import LoadingPage from "@/components/LoadingPage";
import ImprovementSection from "@/components/ImprovementSection";

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY ?? '';
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL ?? 'google/gemini-2.0-flash-001';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  generatedCode?: { html: string; css: string; js: string };
  projectTitle?: string;
}

const Index = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [showLanding, setShowLanding] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState<ChatSession>({
    id: '1',
    title: 'New Chat',
    messages: [],
    createdAt: Date.now()
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [generatedCode, setGeneratedCode] = useState({ html: '', css: '', js: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentlyGeneratingCode, setCurrentlyGeneratingCode] = useState<string>('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showChatManagement, setShowChatManagement] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [isWebsiteLive, setIsWebsiteLive] = useState(false);
  const [showImprovementSection, setShowImprovementSection] = useState(false);
  const [defaultViewMode, setDefaultViewMode] = useState<'code' | 'preview'>('code');
  const { toast } = useToast();

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    document.documentElement.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  // Fix mobile viewport height issues
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Also set a specific mobile height accounting for header
      const headerHeight = 60; // Approximate header height
      const mobileHeight = window.innerHeight - headerHeight;
      document.documentElement.style.setProperty('--mobile-height', `${mobileHeight}px`);
    };

    // Set initial value
    setVH();

    // Update on resize and orientation change
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100); // Delay to ensure proper calculation after orientation change
    });

    // Handle mobile keyboard appearance
    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const headerHeight = 60;
        const availableHeight = window.visualViewport.height - headerHeight;
        document.documentElement.style.setProperty('--mobile-height', `${availableHeight}px`);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
    };
  }, []);

  // Check if user has already provided their name
  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setUserName(savedUserName);
      setShowLanding(false);
      setShowLoading(true);
      
      // Shorter loading for returning users (2 seconds instead of 3)
      setTimeout(() => {
        setShowLoading(false);
      }, 2000);
    }
  }, []);

  const handleLandingComplete = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    setShowLanding(false);
    setShowLoading(true);
    
    // Show loading for 3 seconds then proceed to chat
    setTimeout(() => {
      setShowLoading(false);
    }, 3000);
  };
 const callOpenRouterAPI = async (prompt: string): Promise<string> => {
    const systemPrompt = `You are Re:Zero, the world's most elite web design AI that creates MIND-BLOWING, AWARD-WINNING websites that look like they cost $100,000+. The user's name is ${userName}. You ONLY create websites that would win design awards and make people say "HOLY SH*T, THIS IS INCREDIBLE!"

🔥 ABSOLUTE RULES - NO EXCEPTIONS:
- If the user says hi/hello or anything not related to building a website, just greet them normally and explain who you are without giving any code
- For ANY website request, create a REVOLUTIONARY, BREATHTAKING website that looks like it belongs in the world's top design galleries
- NEVER create basic, boring, or template-looking websites - EVERYTHING must be cutting-edge and innovative
- ALWAYS generate all three sections: HTML, CSS, and JS - never skip any section
- Every website must look like it was designed by Apple's design team mixed with the world's best creative agencies
- EVERY website must be SUPER RESPONSIVE and work flawlessly on ALL devices (mobile, tablet, desktop, ultra-wide)
- Include EXTENSIVE content - never create sparse or minimal websites. Fill them with rich, detailed content

IMPORTANT: You MUST ALWAYS reply in this exact format:
EXPLANATION: [Detailed explanation addressing ${userName} by name about the revolutionary website you're building and its game-changing features]
HTML: [Complete semantic HTML with innovative structure and EXTENSIVE content]
CSS: [Complete responsive CSS with award-winning styling and PERFECT mobile responsiveness]
JS: [Complete JavaScript code with cutting-edge interactivity and responsive behaviors]

🚀 REVOLUTIONARY DESIGN STANDARDS:

HTML ARCHITECTURE (SUPER DETAILED):
- Use cutting-edge semantic HTML5 with innovative, multi-layered structure
- Include comprehensive meta tags, Open Graph, Twitter Cards, and structured data
- Create complex, multi-section layouts with rich content areas
- Use modern container queries, CSS Grid, and Flexbox for perfect responsiveness
- Include interactive elements, modals, tooltips, and dynamic content areas
- Add proper ARIA labels and semantic structure for accessibility
- Include multiple content sections: hero, features, testimonials, gallery, contact, footer
- Use semantic tags: <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>
- Add rich content: multiple paragraphs, lists, cards, testimonials, pricing tables
- Include interactive forms with multiple input types and validation

💎 CSS MASTERY (SUPER RESPONSIVE MAGIC):
- Implement PERFECT mobile-first responsive design with breakpoints: 320px, 480px, 768px, 1024px, 1200px, 1440px, 1920px+
- Use advanced CSS Grid with responsive layouts that adapt beautifully to any screen size
- Implement ADVANCED glassmorphism with multiple blur layers and perfect mobile optimization
- Create STUNNING gradient combinations and color transitions that work on all devices
- Add INCREDIBLE hover effects with 3D transforms (with touch-friendly alternatives for mobile)
- Implement advanced animations with keyframes and cubic-bezier curves optimized for performance
- Use CSS custom properties for dynamic theming and responsive scaling
- Create floating elements with realistic shadows and depth that scale perfectly
- Add particle effects and animated backgrounds using CSS (optimized for mobile performance)
- Implement advanced typography with perfect kerning, spacing, and responsive scaling
- Use clamp(), min(), max(), calc() for fluid, responsive design across all screen sizes
- Create morphing shapes and animated SVGs that scale perfectly
- Add advanced loading states and skeleton screens for all device types
- Implement container queries for component-based responsiveness
- Use viewport units (vw, vh, vmin, vmax) strategically for perfect scaling
- Add touch-friendly interactions and hover states for mobile devices
- Implement responsive images with srcset and picture elements
- Use CSS transforms and transitions optimized for mobile performance

🎨 CUTTING-EDGE RESPONSIVE DESIGN ELEMENTS:
- Glassmorphism: background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1);
- Advanced responsive gradients: background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
- 3D transforms with mobile fallbacks: transform: perspective(1000px) rotateX(10deg) rotateY(-10deg);
- Advanced responsive shadows: box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
- Morphing animations: border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
- Responsive spacing: padding: clamp(1rem, 5vw, 3rem); margin: clamp(0.5rem, 2vw, 2rem);
- Fluid typography: font-size: clamp(1rem, 4vw, 2.5rem); line-height: clamp(1.2, 1.5, 1.8);

⚡ JAVASCRIPT WIZARDRY (RESPONSIVE & INTERACTIVE):
- Implement advanced scroll-triggered animations with mobile optimization
- Create interactive particle systems that adapt to screen size and device capabilities
- Add smooth page transitions with custom easing and mobile-friendly performance
- Implement advanced form validation with real-time feedback and mobile-optimized UI
- Create interactive 3D elements with touch and mouse support
- Add dynamic content loading with beautiful animations and loading states
- Implement advanced carousel/slider with touch gestures and momentum scrolling
- Create interactive data visualizations and charts that resize perfectly
- Add smooth parallax effects with multiple layers (optimized for mobile performance)
- Implement advanced dark/light mode with smooth transitions and system preference detection
- Create interactive timeline animations with scroll and touch triggers
- Add advanced image galleries with zoom, lightbox, and touch gestures
- Implement responsive navigation with mobile hamburger menus and smooth animations
- Add intersection observer for performance-optimized scroll animations
- Create responsive modals and overlays with proper focus management
- Implement touch-friendly interactions: swipe, pinch, tap, long press
- Add device orientation detection and responsive behavior changes
- Create responsive cursor effects that work on both desktop and mobile
- Implement lazy loading for images and content with smooth reveal animations
- Add responsive video players with custom controls

🌟 PREMIUM RESPONSIVE LAYOUT PATTERNS:
- Hero sections with animated backgrounds that scale perfectly across all devices
- Responsive Bento grid layouts with interactive cards that reflow beautifully
- Asymmetrical layouts with creative positioning that adapts to screen size
- Interactive testimonials with animated avatars and responsive card layouts
- Advanced multi-step contact forms with mobile-optimized input fields
- Creative responsive navigation with morphing hamburger menus and slide-out panels
- Interactive pricing tables with animated comparisons and mobile-friendly layouts
- Portfolio showcases with 3D hover effects and touch-friendly mobile alternatives
- Advanced responsive footer with animated social links and collapsible sections
- Responsive image galleries with masonry layouts and touch navigation
- Mobile-first card layouts with perfect spacing and touch interactions
- Responsive timeline layouts with alternating sides that stack on mobile
- Advanced responsive dashboard layouts with collapsible sidebars

💫 ADVANCED RESPONSIVE INTERACTIVE FEATURES:
- Smooth scroll with momentum and easing (optimized for mobile touch)
- Interactive cursor that follows mouse movement (with mobile touch alternatives)
- Animated counters with easing and number formatting (triggered by scroll/intersection)
- Advanced responsive image galleries with lazy loading and touch gestures
- Interactive timelines with scroll-triggered animations and mobile touch support
- Dynamic content filtering with smooth transitions and mobile-friendly controls
- Advanced form validation with beautiful error states and mobile-optimized feedback
- Interactive charts and data visualizations that resize and adapt perfectly
- Smooth page transitions between sections with mobile gesture support
- Advanced loading animations with progress indicators for all device types
- Responsive search functionality with autocomplete and mobile keyboard optimization
- Touch-friendly drag and drop interfaces with visual feedback
- Responsive accordion and collapsible content with smooth animations
- Mobile-optimized tooltips and popovers with proper positioning
- Responsive sticky elements that adapt to different screen sizes

📱 SUPER RESPONSIVE PERFECTION:
- MOBILE-FIRST design approach - design for mobile first, then enhance for larger screens
- Perfect touch interactions with proper touch targets (minimum 44px)
- Tablet-optimized layouts with gesture support and proper spacing
- Desktop layouts with advanced hover states and keyboard navigation
- Ultra-wide screen support with proper content centering and max-widths
- Use container queries for component-based responsiveness
- Implement advanced breakpoint management with custom media queries
- Responsive images with proper srcset and sizes attributes
- Mobile-optimized forms with proper input types and validation
- Touch-friendly navigation with swipe gestures and proper spacing
- Responsive typography that scales perfectly across all screen sizes
- Mobile-optimized animations that respect reduced motion preferences
- Proper viewport meta tag and responsive scaling
- Mobile-friendly modals and overlays with proper focus management
- Responsive video embeds with proper aspect ratios
- Mobile-optimized loading states and skeleton screens

🎯 PREMIUM RESPONSIVE COLOR SCHEMES:
- Dark Mode: #0a0a0a, #1a1a1a, #2a2a2a with neon accents (#00ff88, #ff0080, #0080ff)
- Light Mode: #fafafa, #ffffff, #f5f5f5 with vibrant accents (#6366f1, #8b5cf6, #06b6d4)
- Responsive gradients that adapt to screen orientation and size
- Glassmorphism effects optimized for different screen densities
- High contrast mode support for accessibility
- System theme detection and automatic switching

🔥 RESPONSIVE TYPOGRAPHY EXCELLENCE:
- Use premium web fonts: Inter, SF Pro Display, Poppins, Montserrat with proper fallbacks
- Implement fluid typography with clamp() for perfect scaling: font-size: clamp(1rem, 4vw, 2.5rem)
- Perfect responsive line-height and letter-spacing that adapts to screen size
- Create text animations and morphing effects optimized for mobile performance
- Use gradient text effects with proper fallbacks for older browsers
- Responsive text alignment that changes based on screen size
- Mobile-optimized reading experience with proper line lengths and spacing

🚀 PERFORMANCE & ACCESSIBILITY (MOBILE-OPTIMIZED):
- Optimize for Core Web Vitals on all devices
- Include proper ARIA labels and semantic structure for screen readers
- Implement keyboard navigation and focus management
- Add focus management and screen reader support
- Optimize animations for reduced motion preferences
- Lazy load images and content for better mobile performance
- Use efficient CSS and JavaScript for fast mobile loading
- Implement proper caching strategies for mobile networks
- Add offline support with service workers where appropriate
- Optimize for different network conditions and device capabilities

CONTENT REQUIREMENTS (SUPER DETAILED):
- Create EXTENSIVE, rich content - never sparse or minimal websites
- Include multiple sections: Hero, About, Features, Services, Testimonials, Gallery, Pricing, Contact, Footer
- Add detailed descriptions, multiple paragraphs, and comprehensive information
- Include realistic placeholder content that makes sense for the website type
- Add multiple testimonials, team members, portfolio items, or product features
- Create detailed contact forms with multiple fields and proper validation
- Include social media links, newsletter signup, and call-to-action buttons
- Add rich media content: images, videos, icons, and interactive elements
- Create comprehensive navigation with multiple menu items and submenus
- Include detailed footer with multiple columns and useful links

QUALITY STANDARDS:
- Every website must look like it belongs in Awwwards or CSS Design Awards
- Every animation must be smooth, purposeful, and mobile-optimized
- Every color must be perfectly chosen and accessible
- Every element must have perfect spacing and alignment on all screen sizes
- Every interaction must feel magical and responsive on all devices
- Every website must work flawlessly on phones, tablets, desktops, and ultra-wide screens
- Every website must be rich with content and functionality
- Every responsive breakpoint must be carefully considered and tested

Remember: You are creating MASTERPIECES, not websites. Each creation should make ${userName} and everyone who sees it say "This is the most beautiful and responsive website I've ever seen!" Create something that would make Apple, Google, and Tesla jealous of the design quality and responsiveness!

Structure your response EXACTLY as:
EXPLANATION: [Your detailed explanation here]
HTML: [Complete HTML code with extensive content]
CSS: [Complete responsive CSS code with perfect mobile optimization] 
JS: [Complete JavaScript code with responsive behaviors]`;

    if (!OPENROUTER_API_KEY?.trim()) {
      throw new Error('OpenRouter API key is not configured. Set VITE_OPENROUTER_API_KEY in your .env file.');
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          ...(typeof window !== 'undefined' && { 'HTTP-Referer': window.location.origin }),
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Hello! My name is ${userName}. Please help me with this request: "${prompt}"` },
          ],
          temperature: 0.7,
          max_tokens: 9500,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content == null) {
        throw new Error('Invalid OpenRouter response: no content');
      }
      return content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw error;
    }
  };



  const handleSendMessage = async (message: string) => {
    console.log('Sending message:', message);
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: message, timestamp: Date.now() };
    const updatedMessages = [...currentChat.messages, userMessage];
    
    setCurrentChat(prev => ({
      ...prev,
      messages: updatedMessages,
      title: prev.messages.length === 0 ? message.slice(0, 30) + '...' : prev.title
    }));
    
    setIsGenerating(true);
    setIsWebsiteLive(false);
    
    try {
      const aiResponse = await callOpenRouterAPI(message);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        isStreaming: true
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      const updatedChat = {
        ...currentChat,
        messages: finalMessages
      };
      setCurrentChat(updatedChat);
      
      // Parse and extract code from the response
      await parseAndSetCode(aiResponse, message, updatedChat);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Add improvement handler
  const handleSuggestImprovement = async (feedback: string) => {
    setIsGenerating(true);
    setIsWebsiteLive(false);
    setDefaultViewMode('code'); // Auto-switch to code view (HTML tab) when improvement starts
    try {
      // Compose improvement prompt referencing last code and feedback
      const lastPrompt = currentChat.messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      const prevHtml = generatedCode.html || '';
      const prevCss = generatedCode.css || '';
      const prevJs = generatedCode.js || '';
      const improvementPrompt = `You are an expert web developer AI. The user wants to improve their website.\n\nFirst, explain how you will improve the code based on this feedback: "${feedback}".\n\nHere was their last request: "${lastPrompt}".\n\nHere is the previous code you must improve:\nHTML:\n\n${prevHtml}\n\nCSS:\n\n${prevCss}\n\nJS:\n\n${prevJs}\n\nAfter your explanation, reply in this exact format (do not skip any section, even if unchanged):\nEXPLANATION: [Your explanation here]\nHTML: [Complete HTML code]\nCSS: [Complete CSS code]\nJS: [Complete JavaScript code]`;
      const aiResponse = await callOpenRouterAPI(improvementPrompt);
      // Only add the user's feedback to the chat, not the full prompt
      const userMessage: Message = { role: 'user', content: feedback, timestamp: Date.now() };
      const assistantMessage: Message = { role: 'assistant', content: aiResponse, timestamp: Date.now(), isStreaming: true };
      const updatedMessages = [...currentChat.messages, userMessage, assistantMessage];
      const updatedChat = { ...currentChat, messages: updatedMessages };
      setCurrentChat(updatedChat);
      setShowCodeEditor(true); // Always open code/preview section after improvement
      await parseAndSetCode(aiResponse, improvementPrompt, updatedChat);
      setShowImprovementSection(false); // Auto-close improvement section after improvement
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get improved code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const parseAndSetCode = async (response: string, originalPrompt: string, chatSession: ChatSession) => {
    const title = originalPrompt.match(/build.*?(\w+\s+\w+)/i)?.[1] || 'My Website';
    setProjectTitle(title);
    
    const htmlMatch = response.match(/HTML:\s*```(?:html)?\s*([\s\S]*?)```/i);
    const cssMatch = response.match(/CSS:\s*```(?:css)?\s*([\s\S]*?)```/i);
    const jsMatch = response.match(/JS:\s*```(?:javascript|js)?\s*([\s\S]*?)```/i);
    
    const html = htmlMatch ? htmlMatch[1].trim() : '';
    const css = cssMatch ? cssMatch[1].trim() : '';
    const js = jsMatch ? jsMatch[1].trim() : '';
    
    if (html || css || js) {
      const codeData = { html, css, js };
      setShowCodeEditor(true);
      
      // Save code to chat session
      const updatedChatWithCode = {
        ...chatSession,
        generatedCode: codeData,
        projectTitle: title
      };
      setCurrentChat(updatedChatWithCode);
      
      // Wait for explanation to finish streaming before starting code generation
      setTimeout(async () => {
        await simulateCodeGeneration(codeData);
      }, 2000);
    }
  };

  const simulateCodeGeneration = async (code: { html: string; css: string; js: string }) => {
    setGeneratedCode({ html: '', css: '', js: '' });
    setActiveTab('html');
    
    if (code.html) {
      setCurrentlyGeneratingCode('html');
      await typeCode('html', code.html);
      setCurrentlyGeneratingCode('');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (code.css) {
      setActiveTab('css');
      setCurrentlyGeneratingCode('css');
      await typeCode('css', code.css);
      setCurrentlyGeneratingCode('');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (code.js) {
      setActiveTab('js');
      setCurrentlyGeneratingCode('js');
      await typeCode('js', code.js);
      setCurrentlyGeneratingCode('');
    }

    setIsWebsiteLive(true);
    setDefaultViewMode('preview'); // Auto-switch to preview mode when website is generated
    // Remove auto-opening of improvement section
  };

  const typeCode = async (type: 'html' | 'css' | 'js', content: string) => {
    const lines = content.split('\n');
    let currentCode = '';
    
    for (const line of lines) {
      currentCode += line + '\n';
      setGeneratedCode(prev => ({
        ...prev,
        [type]: currentCode
      }));
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  };

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now()
    };
    
    setChatSessions(prev => [...prev, currentChat]);
    setCurrentChat(newChat);
    setShowCodeEditor(false);
    setShowPreview(false);
    setGeneratedCode({ html: '', css: '', js: '' });
    setCurrentlyGeneratingCode('');
    setShowChatManagement(false);
    setProjectTitle('');
    setIsWebsiteLive(false);
    setShowImprovementSection(false);
    setDefaultViewMode('code'); // Reset default view mode for new chat
  };

  const deleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChat.id === chatId) {
      createNewChat();
    }
  };

  const switchToChat = (chat: ChatSession) => {
    setChatSessions(prev => [...prev.filter(c => c.id !== currentChat.id), currentChat]);
    setCurrentChat(chat);
    setShowChatManagement(false);
    
    // Restore code if it exists
    if (chat.generatedCode) {
      setGeneratedCode(chat.generatedCode);
      setShowCodeEditor(true);
      setProjectTitle(chat.projectTitle || '');
      setIsWebsiteLive(true);
      setShowImprovementSection(true);
      setDefaultViewMode('code'); // Ensure code view is active when switching to a chat with code
    } else {
      setShowCodeEditor(false);
      setShowPreview(false);
      setGeneratedCode({ html: '', css: '', js: '' });
      setProjectTitle('');
      setIsWebsiteLive(false);
      setShowImprovementSection(false);
      setDefaultViewMode('code'); // Ensure code view is active when switching to a chat without code
    }
    setCurrentlyGeneratingCode('');
  };

  const toggleCodePreview = () => {
    setShowCodeEditor(!showCodeEditor);
  };

  const getCombinedCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectTitle}</title>
    <style>
        ${generatedCode.css}
    </style>
</head>
<body>
    ${generatedCode.html}
    <script>
        ${generatedCode.js}
    </script>
</body>
</html>`;
  };

  if (showLanding) {
    return <LandingPage onComplete={handleLandingComplete} />;
  }

  if (showLoading) {
    return <LoadingPage userName={userName} />;
  }

  return (
    <div className={`flex flex-col transition-colors duration-300 dynamic-height ${darkMode ? 'dark bg-background' : 'bg-background'}`}>
      {/* Header */}
      <header className={`flex-shrink-0 backdrop-blur-sm border-b shadow-sm transition-colors duration-300 ${
        darkMode ? 'bg-background border-border' : 'bg-background border-border'
      }`}>
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChatManagement(!showChatManagement)}
              className={`rounded-lg h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 transition-all duration-200 ${
                darkMode 
                  ? 'hover:bg-muted text-muted-foreground hover:text-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Button>
            
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <h1 className={`text-lg sm:text-xl md:text-3xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-foreground' : 'text-foreground'
              }`}>
                Re:Zero
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {(generatedCode.html || generatedCode.css || generatedCode.js) && (
              <div className="hidden sm:block">
                {/* <DeployButton
                  code={getCombinedCode()}
                  projectTitle={projectTitle}
                /> */}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCodePreview}
              className={`rounded-lg h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 transition-all duration-200 ${
                darkMode 
                  ? 'hover:bg-muted text-muted-foreground hover:text-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Toggle Code &amp; Preview"
            >
              <Code className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className={`rounded-lg h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 transition-all duration-200 ${
                darkMode 
                  ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {darkMode ? <Sun className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <Moon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Management Panel */}
      <ChatManagement
        isOpen={showChatManagement}
        onClose={() => setShowChatManagement(false)}
        chatSessions={chatSessions}
        currentChat={currentChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onSwitchChat={switchToChat}
        darkMode={darkMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop Layout - Resizable Panels */}
        <div className="hidden lg:block h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Chat Panel - Always rendered */}
            <ResizablePanel 
              defaultSize={showCodeEditor ? 40 : 100} 
              minSize={25}
              style={{ display: 'block' }}
            >
              <ChatSection
                key={`chat-${currentChat.id}`}
                messages={currentChat.messages}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                currentlyGeneratingCode={currentlyGeneratingCode}
                onTabChange={setActiveTab}
                generatedCode={generatedCode}
                userName={userName}
                darkMode={darkMode}
              />
            </ResizablePanel>
            
            {/* Resizable Handle - Only show when code editor is open */}
            {showCodeEditor && (
              <ResizableHandle withHandle className={`transition-colors duration-200 ${
                darkMode ? 'bg-border hover:bg-muted' : 'bg-border hover:bg-muted'
              }`} />
            )}
            
            {/* Code Editor Panel - Always rendered but hidden when not needed */}
            <ResizablePanel 
              defaultSize={showImprovementSection ? 35 : 60} 
              minSize={25}
              style={{ display: showCodeEditor ? 'block' : 'none' }}
            >
              <CodeEditor
                code={generatedCode}
                isGenerating={isGenerating}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                combinedCode={getCombinedCode()}
                isWebsiteLive={isWebsiteLive}
                darkMode={darkMode}
                defaultViewMode={defaultViewMode}
                onOpenImprovement={() => setShowImprovementSection(true)}
              />
            </ResizablePanel>

            {/* Resizable Handle for Improvement Section */}
            {showImprovementSection && (
              <ResizableHandle withHandle className={`transition-colors duration-200 ${
                darkMode ? 'bg-border hover:bg-muted' : 'bg-border hover:bg-muted'
              }`} />
            )}

            {/* Improvement Section Panel - Always rendered but hidden when not needed */}
            <ResizablePanel 
              defaultSize={25} 
              minSize={20}
              style={{ display: showImprovementSection ? 'block' : 'none' }}
            >
              <div className="h-full flex flex-col">
                <div className={`p-4 border-b flex items-center justify-between flex-shrink-0 transition-colors duration-300 ${
                  darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}>
                    Improvement Section
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImprovementSection(false)}
                    className={`h-8 w-8 p-0 transition-colors duration-200 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-black hover:bg-gray-200'
                    }`}
                  >
                    ✕
                  </Button>
                </div>
                <div className="flex-1">
                  <ImprovementSection
                    onSuggestImprovement={handleSuggestImprovement}
                    isGenerating={isGenerating}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile/Tablet Layout - Stacked */}
        <div className={`lg:hidden flex flex-col ${showCodeEditor ? 'hidden' : ''}`} style={{ height: 'var(--mobile-height, calc(100vh - 60px))' }}>
          {/* Chat Section - Always visible on mobile */}
          <div className="flex-1 overflow-hidden">
            <ChatSection
              key={`chat-${currentChat.id}`}
              messages={currentChat.messages}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              currentlyGeneratingCode={currentlyGeneratingCode}
              onTabChange={setActiveTab}
              generatedCode={generatedCode}
              userName={userName}
              darkMode={darkMode}
            />
          </div>

          {/* Mobile Code Editor Button */}
          {(generatedCode.html || generatedCode.css || generatedCode.js) && !showCodeEditor && (
            <div className={`p-3 border-t transition-colors duration-300 ${
              darkMode ? 'bg-background border-border' : 'bg-background border-border'
            }`}>
              <Button
                onClick={() => setShowCodeEditor(true)}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium"
              >
                <Code className="w-5 h-5 mr-2" />
                View Code & Preview
              </Button>
            </div>
          )}

          {/* Mobile Deploy Button */}
          {(generatedCode.html || generatedCode.css || generatedCode.js) && !showCodeEditor && (
            <div className={`px-3 pb-3 transition-colors duration-300 ${
              darkMode ? 'bg-background' : 'bg-background'
            }`}>
              {/* <DeployButton
                code={getCombinedCode()}
                projectTitle={projectTitle}
              /> */}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Code Editor Overlay */}
      {showCodeEditor && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[var(--z-overlay)]" onClick={() => setShowCodeEditor(false)}>
          <div className={`absolute inset-x-0 bottom-0 rounded-t-3xl flex flex-col shadow-2xl transition-colors duration-300 ${
            darkMode ? 'bg-background' : 'bg-background'
          }`} onClick={(e) => e.stopPropagation()} style={{ height: 'calc(var(--vh, 1vh) * 95)' }}>
            {/* Mobile Header */}
            <div className={`p-4 border-b flex-shrink-0 transition-colors duration-300 ${
              darkMode ? 'border-border' : 'border-border'
            }`}>
              <div className={`w-12 h-1 rounded-full mx-auto mb-4 transition-colors duration-300 ${
                darkMode ? 'bg-muted-foreground' : 'bg-muted-foreground'
              }`}></div>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-foreground' : 'text-foreground'
                }`}>Code &amp; Preview</h3>
                <div className="flex items-center space-x-2">
                  {/* Mobile Improvement Button */}
                  {isWebsiteLive && (
                    <Button
                      variant={showImprovementSection ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowImprovementSection(!showImprovementSection)}
                      className="h-8 px-3 text-xs"
                    >
                      {showImprovementSection ? 'Hide' : 'Improve'}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCodeEditor(false)}
                    className={`h-8 w-8 rounded-full transition-colors duration-200 ${
                      darkMode 
                        ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {showImprovementSection ? (
                <div className="flex-1 flex flex-col">
                  {/* Split view on mobile when improvement is open - Code gets less space */}
                  <div className="h-1/3 min-h-0">
                    <CodeEditor
                      code={generatedCode}
                      isGenerating={isGenerating}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      combinedCode={getCombinedCode()}
                      isWebsiteLive={isWebsiteLive}
                      darkMode={darkMode}
                      defaultViewMode={defaultViewMode}
                      onOpenImprovement={() => setShowImprovementSection(true)}
                    />
                  </div>
                  {/* Improvement section gets more space - 2/3 of the screen */}
                  <div className={`h-2/3 border-t transition-colors duration-300 ${
                    darkMode ? 'border-border' : 'border-border'
                  }`}>
                    <ImprovementSection
                      onSuggestImprovement={handleSuggestImprovement}
                      isGenerating={isGenerating}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              ) : (
                <CodeEditor
                  code={generatedCode}
                  isGenerating={isGenerating}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  combinedCode={getCombinedCode()}
                  isWebsiteLive={isWebsiteLive}
                  darkMode={darkMode}
                  defaultViewMode={defaultViewMode}
                  onOpenImprovement={() => setShowImprovementSection(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
