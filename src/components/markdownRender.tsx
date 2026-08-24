'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Check, 
  Copy, 
  Download, 

  Maximize2,
  Minimize2,
  FileCode,
  
  Sparkles
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Card,
  CardHeader,
  CardContent,
  
} from '@/components/ui/card'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const { theme } = useTheme()
  
  const isDark = theme === 'dark'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      tsx: 'tsx',
      jsx: 'jsx',
      bash: 'sh',
      json: 'json',
      html: 'html',
      css: 'css',
      yaml: 'yml',
      markdown: 'md',
      sql: 'sql',
      rust: 'rs',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      ruby: 'rb',
      php: 'php',
      swift: 'swift',
      kotlin: 'kt',
    }
    const ext = extMap[language] || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const languageIcons: Record<string, React.ReactNode> = {
    python: '🐍',
    javascript: '📜',
    typescript: '📘',
    bash: '💻',
    json: '📋',
    html: '🌐',
    css: '🎨',
    sql: '🗄️',
    rust: '🦀',
    go: '🐹',
    java: '☕',
    cpp: '⚙️',
    ruby: '💎',
    php: '🐘',
    swift: '🦅',
    kotlin: '🎯',
  }

  const languageColors: Record<string, string> = {
    python: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    javascript: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    typescript: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
    bash: 'bg-green-500/10 text-green-500 border-green-500/20',
    json: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    html: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    css: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    sql: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    rust: 'bg-red-500/10 text-red-500 border-red-500/20',
    go: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  }

  const codeLines = code.split('\n').length
  const lineCount = codeLines > 50 ? '50+' : codeLines

  const syntaxStyle = isDark ? oneDark : oneLight

  return (
    <Card className={cn(
      "my-4 overflow-hidden border shadow-sm",
      expanded && "fixed inset-4 z-50 shadow-2xl",
      expanded && "animate-in zoom-in-95 duration-200"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "font-mono text-xs gap-1.5",
              languageColors[language] || 'bg-muted/50'
            )}
          >
            {languageIcons[language] && (
              <span className="text-sm">{languageIcons[language]}</span>
            )}
            {language}
            <span className="text-[10px] opacity-60 ml-1">
              • {lineCount} lines
            </span>
          </Badge>
        </div>
        <div className="flex items-center gap-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                >
                  <FileCode className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle line numbers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{expanded ? 'Minimize' : 'Expand'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={handleDownload}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {expanded && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10"
            onClick={() => setExpanded(false)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}
        <ScrollArea className={cn(
          "relative",
          expanded ? "h-[calc(100vh-12rem)]" : "max-h-150"
        )}>
          <SyntaxHighlighter
            style={syntaxStyle}
            language={language}
            PreTag="div"
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '0.875rem',
              padding: '1rem',
              background: 'transparent',
            }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {code.replace(/\n$/, '')}
          </SyntaxHighlighter>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mt-8 mb-4 pb-2 border-b border-border">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-6 mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-5 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="leading-7 not-first:mt-4 text-foreground/90">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2 text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal [&>li]:mt-2 text-foreground/90">
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-4 border-l-4 border-primary pl-6 italic text-muted-foreground bg-muted/30 py-3 rounded-r-md">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              className="rounded-lg my-6 max-w-full h-auto border shadow-md hover:shadow-xl transition-shadow duration-200"
            />
          ),
          hr: () => <Separator className="my-8" />,
          table: ({ children }) => (
            <div className="my-6 rounded-lg border shadow-sm overflow-hidden">
              <Table>
                {children}
              </Table>
            </div>
          ),
          thead: ({ children }) => (
            <TableHeader className="bg-linear-to-r from-primary/5 to-primary/10">
              {children}
            </TableHeader>
          ),
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => (
            <TableRow className={cn(
              "hover:bg-muted/30 transition-colors",
              "even:bg-muted/10"
            )}>
              {children}
            </TableRow>
          ),
          th: ({ children }) => (
            <TableHead className="font-semibold whitespace-nowrap text-foreground">
              {children}
 
            </TableHead>
          ),
          td: ({ children }) => (
            <TableCell className="text-foreground/80">
              {children}
            </TableCell>
          ),
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match

            if (isInline) {
              return (
                <code
                  className="relative rounded bg-muted/70 px-[0.4rem] py-[0.15rem] font-mono text-sm font-medium text-primary"
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return <CodeBlock language={match[1]} code={String(children)} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}