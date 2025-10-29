let navigatefn: (url: string) => void;

export function setNavigateFunction(fn: (url: string) => void) {
    navigatefn = fn;
}

export function navigateTo(url: string) {
    if (navigatefn) {
        navigatefn(url);
    }  else {
        console.error("Navigate function is not set.");
    }
}