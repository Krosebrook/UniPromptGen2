import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext.tsx';
import { getBillingUsage } from '../../services/apiService.ts';
import { SpinnerIcon } from '../icons/Icons.tsx';

const PLAN_LIMITS = {
    Free: 10000,
    Pro: 100000,
    Enterprise: 1000000,
};

const BillingSettings: React.FC = () => {
    const { currentWorkspace } = useWorkspace();
    const [usage, setUsage] = useState<{apiCalls: number} | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchUsage = async () => {
            if (currentWorkspace) {
                setIsLoading(true);
                const result = await getBillingUsage(currentWorkspace.id);
                setUsage(result);
                setIsLoading(false);
            }
        };
        fetchUsage();
    }, [currentWorkspace]);

    if (isLoading || !currentWorkspace || !usage) {
        return <div className="flex justify-center items-center h-48"><SpinnerIcon className="h-8 w-8 text-primary" /></div>;
    }
    
    const plan = currentWorkspace.plan;
    const limit = PLAN_LIMITS[plan];
    const usagePercentage = (usage.apiCalls / limit) * 100;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">Billing & Usage</h2>
                <p className="text-sm text-muted-foreground">Manage your subscription and monitor your usage for the current cycle.</p>
            </div>
            
            <div className="p-4 bg-secondary rounded-lg flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="text-lg font-semibold text-primary">{plan}</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium bg-background rounded-md hover:bg-accent disabled:opacity-50" disabled>
                    Manage Subscription
                </button>
            </div>

            <div>
                <h3 className="text-lg font-semibold">API Usage</h3>
                <p className="text-sm text-muted-foreground">Your usage resets on the 1st of each month.</p>
                <div className="mt-3">
                    <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-foreground">API Calls</span>
                        <span className="text-muted-foreground">
                            {usage.apiCalls.toLocaleString()} / {limit.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-full bg-input rounded-full h-2.5">
                        <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{width: `${Math.min(usagePercentage, 100)}%`}}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSettings;