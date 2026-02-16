"use client"

import * as React from "react"
import {
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Calculator,
    Search,
    LayoutDashboard,
    FileText,
    Plus,
    BookOpen,
    Sparkles,
    Zap,
} from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { DialogTitle } from "@/components/ui/dialog"

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-foreground/50 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-lg border border-transparent hover:border-foreground/10 transition-all w-64 justify-between group"
            >
                <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search...
                </span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-foreground/10 bg-background px-1.5 font-mono text-[10px] font-medium text-foreground/50 opacity-100 group-hover:border-foreground/20">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {/* Mobile Trigger Icon */}
            <button
                onClick={() => setOpen(true)}
                className="lg:hidden p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            >
                <Search className="h-5 w-5" />
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <DialogTitle className="sr-only">Command Palette</DialogTitle>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/courses"))}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>My Courses</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/ai-lab"))}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            <span>AI Lab</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Quick Actions">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/courses/new"))}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Create New Course</span>
                            <CommandShortcut>⌘C</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/assignments/new"))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>New Assignment</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/profile"))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/subscription"))}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                            <CommandShortcut>⌘B</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
