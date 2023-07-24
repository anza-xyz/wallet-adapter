export function formatNumber(num: number) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}