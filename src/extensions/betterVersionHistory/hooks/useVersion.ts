import { useState, useEffect } from 'react';
import { IDataProvider } from '../providers/DataProvider';
import { IVersion } from '../models/IVersion';
import { IVersionsFilter } from '../models/IVersionsFilter';

export default function useVersions(provider: IDataProvider, filters: IVersionsFilter = {}): { versions: IVersion[], isLoading: boolean } {
    const [versions, setVersions] = useState<IVersion[]>(null);

    async function fetchData(): Promise<void> {
        const result = await provider.GetVersions(filters);
        setVersions(result);
    }

    useEffect(() => {
        fetchData();
    }, [filters]);

    return {
        versions, isLoading: versions === null,
    };
}