import LogoDark from "@/assets/Logo_Dark_mode.png";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <img
            src={LogoDark}
            alt="SunoHQ Logo"
            className={cn("h-8 w-auto object-contain", className)}
        />
    );
}
