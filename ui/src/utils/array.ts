
export function any<T>(xs: T[], test: (x: T, i: number) => boolean ): boolean {
    for (var i = 0; i < xs.length; i++) {
        if (test(xs[i], i)) { return true }
    }
    return false
}
