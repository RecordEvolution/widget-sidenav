import { html, css, LitElement, PropertyValues } from 'lit'
import { property, state } from 'lit/decorators.js'
import { TextboxConfiguration } from './definition-schema.js'

type Theme = {
    theme_name: string
    theme_object: any
}
export class WidgetTextbox extends LitElement {
    @property({ type: Object })
    inputData?: TextboxConfiguration

    @property({ type: Object })
    theme?: Theme

    @state() private themeBgColor?: string
    @state() private themeTitleColor?: string
    @state() private themeSubtitleColor?: string

    version: string = 'versionplaceholder'

    update(changedProperties: Map<string, any>) {
        if (changedProperties.has('theme')) {
            this.registerTheme(this.theme)
        }

        super.update(changedProperties)
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.registerTheme(this.theme)
    }

    registerTheme(theme?: Theme) {
        const cssTextColor = getComputedStyle(this).getPropertyValue('--re-text-color').trim()
        const cssBgColor = getComputedStyle(this).getPropertyValue('--re-tile-background-color').trim()
        this.themeBgColor = cssBgColor || this.theme?.theme_object?.backgroundColor
        this.themeTitleColor = cssTextColor || this.theme?.theme_object?.title?.textStyle?.color
        this.themeSubtitleColor =
            cssTextColor || this.theme?.theme_object?.title?.subtextStyle?.color || this.themeTitleColor
    }

    static styles = css`
        :host {
            display: block;
            font-family: sans-serif;
            box-sizing: border-box;
            margin: auto;
        }

        .paging:not([active]) {
            display: none !important;
        }

        .wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            padding: 12px;
            box-sizing: border-box;
        }

        h2 {
            margin: 0;
            padding: 0px;
        }

        h3 {
            margin: 0;
            padding: 12px 0px;
        }

        p {
            margin: 0;
        }
    `

    render() {
        return html`
            <div class="wrapper" style="background-color: ${this.themeBgColor}">
                <h2
                    class="paging"
                    ?active=${this.inputData?.title?.text}
                    style="font-size: ${this.inputData?.title?.fontSize}; 
                        font-weight: ${this.inputData?.title?.fontWeight}; 
                        background-color: ${this.inputData?.title?.backgroundColor};
                        color: ${this.inputData?.title?.color || this.themeTitleColor};"
                >
                    ${this.inputData?.title?.text}
                </h2>
                <h3
                    class="paging"
                    ?active=${this.inputData?.subTitle?.text}
                    style="font-size: ${this.inputData?.subTitle?.fontSize}; 
                        font-weight: ${this.inputData?.subTitle?.fontWeight};
                        color: ${this.inputData?.subTitle?.color || this.themeSubtitleColor};"
                >
                    ${this.inputData?.subTitle?.text}
                </h3>
                <p
                    class="paging"
                    ?active=${this.inputData?.body?.text}
                    style="font-size: ${this.inputData?.body?.fontSize}; 
                        font-weight: ${this.inputData?.body?.fontWeight};
                        color: ${this.inputData?.body?.color || this.themeTitleColor};"
                >
                    ${this.inputData?.body?.text}
                </p>
            </div>
        `
    }
}
window.customElements.define('widget-sidenav-versionplaceholder', WidgetTextbox)
