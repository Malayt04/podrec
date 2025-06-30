"use client";

import { useUploadStore } from "@/lib/stores/upload-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, UploadCloud, File, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function UploadManager() {
  const { queue, isUploading, processQueue, clearCompleted } = useUploadStore();
  const [isOpen, setIsOpen] = useState(false);

  // Automatically open the manager when new files are added to the queue
  useEffect(() => {
    if (queue.length > 0 && !isOpen) {
      setIsOpen(true);
    }
  }, [queue.length, isOpen]);

  // Don't render anything if the queue is empty
  if (queue.length === 0) {
    return null;
  }

  const completedCount = queue.filter(item => item.status === 'completed').length;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 w-96 transition-all duration-300 z-50",
      isOpen ? "translate-y-0" : "translate-y-[calc(100%-4rem)]"
    )}>
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-2xl">
        <CardHeader 
          className="flex flex-row items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CardTitle className="text-base font-medium">
            Upload Progress
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isUploading && <UploadCloud className="h-5 w-5 animate-pulse text-primary" />}
            <span className="text-sm text-muted-foreground">{completedCount} / {queue.length} uploaded</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        {isOpen && (
           <CardContent className="p-3 border-t border-border max-h-80 overflow-y-auto">
             <div className="space-y-3">
               {queue.map(item => (
                 <div key={item.id} className="flex items-center space-x-3">
                   <div className="flex-shrink-0">
                     {item.status === 'completed' ? <CheckCircle className="h-6 w-6 text-green-500"/> : 
                      item.status === 'error' ? <AlertCircle className="h-6 w-6 text-destructive"/> : 
                      <File className="h-6 w-6 text-muted-foreground"/>
                     }
                   </div>
                   <div className="flex-1 overflow-hidden">
                     <p className="text-sm font-medium truncate">{item.file.name}</p>
                     <Progress value={item.progress} className="h-2 mt-1" />
                   </div>
                   <p className="text-sm text-muted-foreground">{item.progress}%</p>
                 </div>
               ))}
             </div>
             <div className="mt-4 flex justify-between space-x-2">
                <Button 
                    onClick={processQueue} 
                    disabled={isUploading || queue.every(q => q.status !== 'queued')}
                    className="w-full"
                >
                    <UploadCloud className="h-4 w-4 mr-2"/>
                    {isUploading ? 'Uploading...' : 'Start Upload'}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={clearCompleted} 
                    disabled={isUploading || completedCount === 0}
                >
                    Clear Completed
                </Button>
             </div>
           </CardContent>
        )}
      </Card>
    </div>
  );
}
