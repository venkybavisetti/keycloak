import { useEffect } from "react";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useStylesAndScripts } from "keycloakify/login/Template.useStylesAndScripts";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import "@digitallabs/one-x-ui/styles.css";
import "../styles/tailwind.css";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const { documentTitle, bodyClassName, kcContext, i18n, doUseDefaultCss, classes, children } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const { msgStr } = i18n;

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", kcContext.realm.displayName);
    }, []);

    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass")
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? kcClsx("kcBodyClass")
    });

    const { isReadyToRender } = useStylesAndScripts({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <div className="bg-[#F0F6FE]">
            <div className="pt-[80px] pl-[80px]">
                <img className="w-[174.32px]" src="HDFCLife_Inspire_Logo.svg" alt="HDFCLife Inspire Logo" />
            </div>
            <div className="flex items-center justify-center min-h-screen ">
                <div className="bg-white p-8 rounded-lg shadow-lg">{children}</div>
            </div>
        </div>
    );
}
