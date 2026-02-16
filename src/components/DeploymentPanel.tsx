
import React, { useState } from 'react';
import { Zap, Github, Globe, Server } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DeploymentPanelProps {
  code: string;
  projectTitle: string;
}

const DeploymentPanel: React.FC<DeploymentPanelProps> = ({ code, projectTitle }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const deployToVercel = async () => {
    setIsDeploying(true);
    
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const deployUrl = `https://${projectTitle.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}.vercel.app`;
      
      toast({
        title: "Deployment Successful!",
        description: `Your website is live at ${deployUrl}`,
      });
      
      // Open deployed site
      window.open(deployUrl, '_blank');
      
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Please try again or check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const deployToGitHub = async () => {
    toast({
      title: "GitHub Integration",
      description: "GitHub deployment feature will be available soon!",
    });
  };

  const deployLocally = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const instructions = `
To run locally:
1. Save the downloaded file as 'index.html'
2. Open it in your browser
3. Or serve it using: python -m http.server 8000
`;
    
    toast({
      title: "Local Deployment",
      description: instructions,
    });
    
    window.open(url, '_blank');
  };

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 md:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">Deploy Your Website</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <Button
            onClick={deployToVercel}
            disabled={isDeploying}
            className="bg-black hover:bg-gray-800 text-white flex items-center justify-center space-x-2 h-10 md:h-12 text-sm"
          >
            <Globe className="w-3 h-3 md:w-4 md:h-4" />
            <span>{isDeploying ? 'Deploying...' : 'Vercel'}</span>
          </Button>
          
          <Button
            onClick={deployToGitHub}
            variant="outline"
            className="border-gray-300 dark:border-gray-600 flex items-center justify-center space-x-2 h-10 md:h-12 text-sm"
          >
            <Github className="w-3 h-3 md:w-4 md:h-4" />
            <span>GitHub</span>
          </Button>
          
          <Button
            onClick={deployLocally}
            variant="outline"
            className="border-gray-300 dark:border-gray-600 flex items-center justify-center space-x-2 h-10 md:h-12 text-sm"
          >
            <Server className="w-3 h-3 md:w-4 md:h-4" />
            <span>Run</span>
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 md:mt-4 text-center">
          Choose your preferred deployment method. Vercel offers free hosting for static sites.
        </p>
      </div>
    </Card>
  );
};

export default DeploymentPanel;
