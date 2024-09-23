import { colors } from "@digitallabs/one-x-ui";
import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
            },
            borderWidth: {
                "3": "3px"
            },
            minWidth: {
                "fill-available": "-webkit-fill-available"
            },
            boxShadow: {
                panel: `0px 20px 32px 0px ${colors.neutral.grey[200]}`
            }
        }
    },
    plugins: []
};
export default config;
