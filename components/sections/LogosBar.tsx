"use client";

import { Marquee } from "@/components/shared/Marquee";
import {
    SiGoogle,
    SiOpenai,
    SiAmazon,
    SiMeta,
    SiSlack,
    SiNotion,
    SiCanva,
    SiZoom,
    SiAdobe,
    SiFigma,
} from "react-icons/si";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const logos = [
    { name: "Google", Icon: SiGoogle },
    { name: "OpenAI", Icon: SiOpenai },
    { name: "Amazon", Icon: SiAmazon },
    { name: "Meta", Icon: SiMeta },
    { name: "Slack", Icon: SiSlack },
    { name: "Notion", Icon: SiNotion },
    { name: "Canva", Icon: SiCanva },
    { name: "Zoom", Icon: SiZoom },
    { name: "Adobe", Icon: SiAdobe },
    { name: "Figma", Icon: SiFigma },
];

export function LogosBar() {
    return (
        <section className="py-12 border-y border-white/5 bg-white/[0.01]">
            <ScrollReveal direction="up">
                <p className="text-center text-xs uppercase tracking-[0.2em] text-white/25 mb-8 font-medium">
                    Trusted by teams at leading companies
                </p>
            </ScrollReveal>

            <Marquee speed={35} pauseOnHover>
                {logos.map((logo) => {
                    const Icon = logo.Icon;
                    return (
                        <div
                            key={logo.name}
                            className="flex items-center gap-2.5 mx-8 group cursor-default select-none"
                        >
                            <Icon className="h-5 w-5 text-white/20 group-hover:text-white/60 transition-all duration-500" />
                            <span className="text-sm font-medium text-white/20 group-hover:text-white/60 transition-all duration-500 whitespace-nowrap">
                                {logo.name}
                            </span>
                        </div>
                    );
                })}
            </Marquee>
        </section>
    );
}
