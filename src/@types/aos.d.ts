declare module 'aos' {
    interface AosOptions {
        duration?: number;
        delay?: number;
        easing?: string;
        once?: boolean;
        mirror?: boolean;
        anchorPlacement?: string;
        offset?: number;
        disable?: string | boolean | (() => boolean);
        startEvent?: string;
        initClassName?: string;
        animatedClassName?: string;
        useClassNames?: boolean;
        disableMutationObserver?: boolean;
        debounceDelay?: number;
        throttleDelay?: number;
    }

    function init(options?: AosOptions): void;
    function refresh(initialize?: boolean): void;
    function refreshHard(): void;

    export { init, refresh, refreshHard };
    export default { init, refresh, refreshHard };
}
