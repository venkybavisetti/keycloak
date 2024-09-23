import React, { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import axios from "axios";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, registrationDisabled, messagesPerField } = kcContext;
    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const [phoneActivated, setPhoneActivated] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [sendButtonText, setSendButtonText] = useState("Send Code");

    const handleSendVerificationCode = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        try {
            const params = { params: { phoneNumber } };
            await axios.get(`http://localhost:8001/realms/${realm.name}/sms/authentication-code`, params);
            setSendButtonText("Code Sent");
            setTimeout(() => setSendButtonText("Send Code"), 60000);
        } catch (error) {
            console.error("Error sending verification code", error);
        }
    };

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username", "password")}
            headerNode={msg("loginAccountTitle")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <div id="kc-registration-container">
                    <div id="kc-registration">
                        <span>
                            {msg("noAccount")}{" "}
                            <a tabIndex={8} href={url.registrationUrl}>
                                {msg("doRegister")}
                            </a>
                        </span>
                    </div>
                </div>
            }
            socialProvidersNode={
                <>
                    {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                        <div id="kc-social-providers" className={kcClsx("kcFormSocialAccountSectionClass")}>
                            <hr />
                            <h2>{msg("identity-provider-login-label")}</h2>
                            <ul className={kcClsx("kcFormSocialAccountListClass", social.providers.length > 3 && "kcFormSocialAccountListGridClass")}>
                                {social.providers.map((...[p, , providers]) => (
                                    <li key={p.alias}>
                                        <a
                                            id={`social-${p.alias}`}
                                            className={kcClsx(
                                                "kcFormSocialAccountListButtonClass",
                                                providers.length > 3 && "kcFormSocialAccountGridItem"
                                            )}
                                            type="button"
                                            href={p.loginUrl}
                                        >
                                            {p.iconClasses && <i className={clsx(kcClsx("kcCommonLogoIdP"), p.iconClasses)} aria-hidden="true"></i>}
                                            <span
                                                className={clsx(kcClsx("kcFormSocialAccountNameClass"), p.iconClasses && "kc-social-icon-text")}
                                                dangerouslySetInnerHTML={{ __html: p.displayName }}
                                            ></span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            }
        >
            <div>
                <button
                    style={{ background: !phoneActivated ? "red" : "", color: !phoneActivated ? "white" : "" }}
                    onClick={() => setPhoneActivated(false)}
                >
                    Username
                </button>
                <button
                    style={{ background: phoneActivated ? "red" : "", color: phoneActivated ? "white" : "" }}
                    onClick={() => setPhoneActivated(true)}
                >
                    Mobile number
                </button>
            </div>
            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                        >
                            <input type="hidden" id="phoneActivated" name="phoneActivated" value={phoneActivated.toString()} />

                            {phoneActivated ? (
                                <div>
                                    <div className={kcClsx("kcFormGroupClass")}>
                                        <label htmlFor="phoneNumber" className={kcClsx("kcLabelClass")}>
                                            {msg("phoneNumber")}
                                        </label>
                                        <input
                                            tabIndex={0}
                                            type="text"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={phoneNumber}
                                            onChange={e => setPhoneNumber(e.target.value)}
                                            aria-invalid={
                                                messagesPerField.existsError("code") || messagesPerField.existsError("phoneNumber") ? "true" : "false"
                                            }
                                            className={kcClsx("kcInputClass", "kcFormSettingClass")}
                                            autoFocus
                                        />
                                        {messagesPerField.existsError("code") ||
                                            (messagesPerField.existsError("phoneNumber") && (
                                                <span id="input-error" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                                    {messagesPerField.getFirstError("phoneNumber", "code")}
                                                </span>
                                            ))}
                                    </div>

                                    <div className={`${kcClsx("kcFormGroupClass")} row`}>
                                        <div className={kcClsx("kcLabelWrapperClass")} style={{ padding: 0 }}>
                                            <label htmlFor="code" className={kcClsx("kcLabelClass")}>
                                                verificationCode
                                            </label>
                                        </div>
                                        <div className="col-xs-8" style={{ padding: "0 5px 0 0" }}>
                                            <input
                                                tabIndex={0}
                                                type="text"
                                                id="code"
                                                name="code"
                                                value={verificationCode}
                                                onChange={e => setVerificationCode(e.target.value)}
                                                aria-invalid={
                                                    messagesPerField.existsError("code") || messagesPerField.existsError("phoneNumber")
                                                        ? "true"
                                                        : "false"
                                                }
                                                className={kcClsx("kcInputClass")}
                                                autoComplete="off"
                                            />
                                            {messagesPerField.existsError("code") && (
                                                <span id="input-error" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                                    {messagesPerField.getFirstError("code", "phoneNumber")}
                                                </span>
                                            )}
                                        </div>
                                        <div className="col-xs-4" style={{ padding: "0 0 0 5px" }}>
                                            <button
                                                tabIndex={0}
                                                style={{ height: 36 }}
                                                className={kcClsx(
                                                    "kcButtonClass",
                                                    "kcButtonPrimaryClass",
                                                    "kcButtonBlockClass",
                                                    "kcButtonLargeClass"
                                                )}
                                                disabled={sendButtonText !== "Send Code"}
                                                onClick={handleSendVerificationCode}
                                            >
                                                {sendButtonText}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {!usernameHidden && (
                                        <div className={kcClsx("kcFormGroupClass")}>
                                            <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                                                {!realm.loginWithEmailAllowed
                                                    ? msg("username")
                                                    : !realm.registrationEmailAsUsername
                                                      ? msg("usernameOrEmail")
                                                      : msg("email")}
                                            </label>
                                            <input
                                                tabIndex={2}
                                                id="username"
                                                className={kcClsx("kcInputClass")}
                                                name="username"
                                                defaultValue={login.username ?? ""}
                                                type="text"
                                                autoFocus
                                                autoComplete="username"
                                                aria-invalid={messagesPerField.existsError("username", "password")}
                                            />
                                            {messagesPerField.existsError("username", "password") && (
                                                <span id="input-error" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                                    {messagesPerField.getFirstError("username", "password")}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className={kcClsx("kcFormGroupClass")}>
                                        <label htmlFor="password" className={kcClsx("kcLabelClass")}>
                                            {msg("password")}
                                        </label>
                                        <input
                                            tabIndex={3}
                                            id="password"
                                            className={kcClsx("kcInputClass")}
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            aria-invalid={messagesPerField.existsError("username", "password")}
                                        />
                                        {messagesPerField.existsError("password", "username") && (
                                            <span id="input-error" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                                {messagesPerField.getFirstError("password", "username")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={clsx(kcClsx("kcFormGroupClass"), kcClsx("kcFormSettingClass"))}>
                                {!phoneActivated && (
                                    <div className={kcClsx("kcFormOptionsWrapperClass")}>
                                        <span>
                                            <a tabIndex={6} href={url.loginResetCredentialsUrl}>
                                                {msg("doForgotPassword")}
                                            </a>
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                                <input type="hidden" id="id-hidden-input" name="hidden-input" value="" />
                                <input
                                    tabIndex={7}
                                    className={clsx(
                                        kcClsx("kcButtonClass"),
                                        kcClsx("kcButtonPrimaryClass"),
                                        kcClsx("kcButtonBlockClass"),
                                        kcClsx("kcButtonLargeClass")
                                    )}
                                    name="login"
                                    id="kc-login"
                                    type="submit"
                                    value={msgStr("doLogIn")}
                                    disabled={isLoginButtonDisabled}
                                />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Template>
    );
}
