import { useState, useEffect, useCallback } from 'react';
import { ABTest } from '../types.ts';
import { getABTestsForTemplate, createABTest, declareWinner as declareWinnerAPI } from '../services/apiService.ts';

export const useABTesting = (templateId?: string) => {
    const [abTests, setAbTests] = useState<ABTest[]>([]);
    const [isABTestModalOpen, setIsABTestModalOpen] = useState(false);
    const [selectedABTest, setSelectedABTest] = useState<ABTest | null>(null);

    const fetchABTests = useCallback(async () => {
        if (templateId) {
            const tests = await getABTestsForTemplate(templateId);
            setAbTests(tests);
        }
    }, [templateId]);

    useEffect(() => {
        fetchABTests();
    }, [fetchABTests]);

    const createTest = async (newTestData: Partial<ABTest>) => {
        if (!templateId) return;
        const testToSave: Partial<ABTest> = { ...newTestData, templateId };
        const savedTest = await createABTest(testToSave);
        setAbTests(prev => [...prev, savedTest]);
        setIsABTestModalOpen(false);
    };

    const declareWinner = async (testId: string, winner: 'A' | 'B') => {
        const winnerKey = winner === 'A' ? 'versionA' : 'versionB';
        const updatedTest = await declareWinnerAPI(testId, winnerKey);
        setAbTests(prev => prev.map(t => t.id === testId ? updatedTest : t));
        setSelectedABTest(updatedTest);
    };

    return {
        abTests,
        isABTestModalOpen,
        setIsABTestModalOpen,
        selectedABTest,
        setSelectedABTest,
        createTest,
        declareWinner,
    };
};
