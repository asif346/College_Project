
import React, { useState } from 'react';
import { Rocket, Globe, Github, Server, ChevronDown, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DeployButtonProps {
  code: string;
  projectTitle: string;
}

const DeployButton: React.FC<DeployButtonProps> = ({ code, projectTitle }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const deployLive = async () => {
    setIsDeploying(true);
    
    try {
      // Create a zip file with the website
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add the HTML file
      zip.file("index.html", code);
      
      // Generate the zip
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create a download link for the zip
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.replace(/\s+/g, '-').toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Open Netlify Drop for instant deployment
      const dropUrl = 'https://app.netlify.com/drop';
      window.open(dropUrl, '_blank');
      
      toast({
        title: "🚀 Deploy to Netlify",
        description: "Code downloaded! Drag the ZIP file to Netlify Drop for instant live deployment.",
      });
      
    } catch (error) {
      console.error('Deployment error:', error);
      toast({
        title: "Deployment Error",
        description: "Please try again or use manual deployment.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const deployToVercel = async () => {
    setIsDeploying(true);
    
    try {
      // Create a zip file for Vercel
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      zip.file("index.html", code);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create a download link for the zip
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.replace(/\s+/g, '-').toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Open Vercel
      const vercelUrl = 'https://vercel.com/new';
      window.open(vercelUrl, '_blank');
      
      toast({
        title: "Deploy to Vercel",
        description: "Code downloaded! Upload the ZIP file to Vercel for live deployment.",
      });
      
    } catch (error) {
      toast({
        title: "Deployment Error",
        description: "Please try again or deploy manually to Vercel.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const deployToGitHub = async () => {
    try {
      // Create a new repository on GitHub
      const repoName = projectTitle.replace(/\s+/g, '-').toLowerCase();
      const githubUrl = `https://github.com/new?name=${repoName}&description=Created%20with%20Re:Zero%20AI`;
      
      // Download the code as a file for the user
      downloadCode();
      
      // Open GitHub new repository page
      window.open(githubUrl, '_blank');
      
      toast({
        title: "GitHub Repository",
        description: "Code downloaded! Create a new repository on GitHub and upload your files.",
      });
      
    } catch (error) {
      toast({
        title: "GitHub Error",
        description: "Please create a repository manually on GitHub.",
        variant: "destructive",
      });
    }
  };

  const deployLocally = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(url, '_blank');
    
    toast({
      title: "Running Locally",
      description: "Your website is now running in a new tab!",
    });
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success!",
      description: "Your website code has been downloaded.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDeploying || !code}
          className="flex items-center space-x-1 h-8 sm:h-10 w-full sm:w-auto"
        >
          {isDeploying ? (
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <Rocket className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          <span className="text-xs sm:text-sm">
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 sm:w-56">
        <DropdownMenuItem onClick={deployLive} disabled={isDeploying} className="py-2 sm:py-3">
          <Globe className="w-4 h-4 mr-2 sm:mr-3" />
          <span className="text-sm">Deploy Live (Netlify)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deployToVercel} disabled={isDeploying} className="py-2 sm:py-3">
          <Globe className="w-4 h-4 mr-2 sm:mr-3" />
          <span className="text-sm">Deploy to Vercel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deployToGitHub} className="py-2 sm:py-3">
          <Github className="w-4 h-4 mr-2 sm:mr-3" />
          <span className="text-sm">GitHub Pages</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deployLocally} className="py-2 sm:py-3">
          <Server className="w-4 h-4 mr-2 sm:mr-3" />
          <span className="text-sm">Run Local</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadCode} className="py-2 sm:py-3">
          <svg className="w-4 h-4 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm">Download Code</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DeployButton;
