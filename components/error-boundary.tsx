"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-6 bg-background">
          <Card className="max-w-md border-red-500/20 bg-red-500/[0.02] shadow-lg dark:card-glow">
            <CardHeader className="border-b border-red-500/10 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Clinical Data Error
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                {this.props.fallbackMessage ||
                  "An unexpected error occurred while retrieving clinical information."}
              </p>
              {this.state.error?.message && (
                <p className="mt-3 font-mono text-[10px] p-3 rounded-lg bg-black/5 dark:bg-white/5 text-muted-foreground break-all">
                  LOG: {this.state.error.message}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-6 w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] border-red-500/20 text-red-600 hover:bg-red-500/5 transition-all"
                onClick={() => this.setState({ hasError: false })}
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry Sync
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
