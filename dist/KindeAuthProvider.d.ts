import { KindeAuthHook } from './useKindeAuth';

export declare const KindeAuthContext: import('react').Context<KindeAuthHook | undefined>;
export declare const KindeAuthProvider: ({ children, config, }: {
    children: React.ReactNode;
    config: {
        domain: string | undefined;
        clientId: string | undefined;
        scopes?: string;
    };
}) => import("react/jsx-runtime").JSX.Element;
