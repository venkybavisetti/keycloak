import { useState, useEffect } from "react";
import axios from "axios";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";

export default function LoginUpdatePhoneNumber(props: PageProps<Extract<KcContext, { pageId: "login-update-phone-number.ftl" }>, I18n>) {
    const { kcContext, i18n, Template, doUseDefaultCss, classes } = props;
    const { url, realm, phoneNumber } = kcContext;
    const { msg } = i18n;
    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [phone, setPhone] = useState<string>(phoneNumber ?? "");
    const [code, setCode] = useState<string>("");
    const [sendButtonText, setSendButtonText] = useState<string>("sendVerificationCode");
    const initSendButtonText = "sendVerificationCode";

    const sendVerificationCode = () => {
        setErrorMessage(null);
        if (!phone.trim()) {
            setErrorMessage("requiredPhoneNumber");
            return;
        }
        if (sendButtonText !== initSendButtonText) return;

        axios
            .get(`http://localhost:8001/realms/${realm.name}/sms/verification-code`, { params: { phoneNumber: phone } })
            .then(res => {
                disableSend(res.data.expires_in);
            })
            .catch(err => {
                setErrorMessage(err.response?.data?.error ?? "unknownError");
            });
    };

    const disableSend = (seconds: number) => {
        if (seconds <= 0) {
            setSendButtonText(initSendButtonText);
        } else {
            const minutes = Math.floor(seconds / 60)
                .toString()
                .padStart(2, "0");
            const seconds_ = (seconds % 60).toString().padStart(2, "0");
            setSendButtonText(`${minutes}:${seconds_}`);
            setTimeout(() => disableSend(seconds - 1), 1000);
        }
    };

    useEffect(() => {
        if (phoneNumber) {
            sendVerificationCode();
        }
    }, []);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo={false}
            headerNode={"updatePhoneNumber"}
        >
            {errorMessage && (
                <div className={`alert-error ${kcClsx("kcAlertClass")} pf-m-danger`}>
                    <div className="pf-c-alert__icon">
                        <span className={kcClsx("kcFeedbackErrorIcon")}></span>
                    </div>
                    <span className={kcClsx("kcAlertTitleClass")}>{errorMessage}</span>
                </div>
            )}

            <div id="kc-form">
                <div id="kc-form-wrapper">
                    <form id="kc-form-login" action={url.loginAction} method="post">
                        <div className={`${kcClsx("kcFormGroupClass")} row`}>
                            <div className="col-xs-12" style={{ padding: 0 }}>
                                <label htmlFor="phoneNumber" className={kcClsx("kcLabelClass")}>
                                    {msg("phoneNumber")}
                                </label>
                            </div>
                            <div className="col-xs-8" style={{ padding: "0 5px 0 0" }}>
                                <input
                                    id="phoneNumber"
                                    className={kcClsx("kcInputClass")}
                                    name="phoneNumber"
                                    type="tel"
                                    autoFocus={!phoneNumber}
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    autoComplete="mobile tel"
                                />
                            </div>
                            <div className="col-xs-4" style={{ padding: "0 0 0 5px" }}>
                                <input
                                    style={{ height: "36px" }}
                                    className={`${kcClsx("kcButtonClass")} ${kcClsx("kcButtonPrimaryClass")} ${kcClsx("kcButtonBlockClass")} ${kcClsx("kcButtonLargeClass")}`}
                                    disabled={sendButtonText !== initSendButtonText}
                                    onClick={sendVerificationCode}
                                    type="button"
                                    value={sendButtonText}
                                />
                            </div>
                        </div>

                        <div className={`${kcClsx("kcFormGroupClass")} row`}>
                            <label htmlFor="code" className={kcClsx("kcLabelClass")}>
                                {"verificationCode"}
                            </label>
                            <input
                                id="code"
                                className={kcClsx("kcInputClass")}
                                name="code"
                                type="text"
                                autoFocus={!!phoneNumber}
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div id="kc-form-buttons" className={kcClsx("kcFormGroupClass")}>
                            <input type="hidden" name="credentialId" value={kcContext.auth.selectedCredential ?? ""} />
                            <input
                                className={`${kcClsx("kcButtonClass")} ${kcClsx("kcButtonPrimaryClass")} ${kcClsx("kcButtonBlockClass")} ${kcClsx("kcButtonLargeClass")}`}
                                name="save"
                                type="submit"
                                value={"doSubmit"}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </Template>
    );
}
