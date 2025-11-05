"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Maximize, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  title: string;
  url: string;
  description?: string;
}

export function VideoPlayer({ title, url, description }: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if URL is YouTube
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');
  const isLocalVideo = url.startsWith('/uploads/');

  const getEmbedUrl = () => {
    if (isYouTube) {
      const videoId = url.includes('watch?v=') 
        ? url.split('watch?v=')[1]?.split('&')[0]
        : url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (isVimeo) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-500" />
            {title}
          </h4>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Inline Video Player */}
      <div className="rounded-lg overflow-hidden bg-black mb-3">
        {isYouTube || isVimeo ? (
          <iframe
            className="w-full aspect-video"
            src={getEmbedUrl()}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="w-full"
            controls
            preload="metadata"
          >
            <source src={url} type="video/mp4" />
            <source src={url} type="video/webm" />
            <source src={url} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Maximize className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="rounded-lg overflow-hidden bg-black">
              {isYouTube || isVimeo ? (
                <iframe
                  className="w-full aspect-video"
                  src={getEmbedUrl()}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className="w-full"
                  controls
                  autoPlay
                  preload="metadata"
                >
                  <source src={url} type="video/mp4" />
                  <source src={url} type="video/webm" />
                  <source src={url} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
