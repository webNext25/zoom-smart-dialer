import { mutate } from "swr";

export async function optimisticMutate<T>(
    key: string,
    updateFn: (data: T) => T,
    requestFn: () => Promise<any>
) {
    // Get current data from cache
    const { data: currentData } = await mutate(key, undefined, { revalidate: false }) as any;

    // Optimistically update
    await mutate(key, updateFn(currentData), false);

    try {
        // Make actual request
        await requestFn();
        // Revalidate from server
        await mutate(key);
    } catch (error) {
        // Revert on error
        await mutate(key, currentData, false);
        throw error;
    }
}

// Helper for optimistic deletion
export async function optimisticDelete<T extends { id: string }>(
    key: string,
    id: string,
    deleteFn: () => Promise<void>
) {
    return optimisticMutate<T[]>(
        key,
        (data) => data.filter((item) => item.id !== id),
        deleteFn
    );
}
