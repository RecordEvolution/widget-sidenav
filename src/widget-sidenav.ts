import { html, css, LitElement, PropertyValues } from 'lit'
import { property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { InputData } from './definition-schema'

import '@material/web/icon/icon.js'

type Theme = {
    theme_name: string
    theme_object: any
}
export class WidgetTextbox extends LitElement {
    @property({ type: Object }) inputData?: InputData
    @property({ type: Object }) theme?: Theme
    @property({ type: String }) route?: string

    @state() private themeBgColor?: string
    @state() private themeTitleColor?: string

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
    }

    handleNavItemClick(item: { label?: string; iconName?: string; route?: string }) {
        console.log('Navigating to:', item.route)
        const event = new CustomEvent('nav-submit', {
            detail: { path: item.route },
            bubbles: true,
            composed: true
        })
        this.dispatchEvent(event)
    }

    normalizeRoute(route?: string) {
        if (!route) return '/'
        return route
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
            gap: 12px;
            box-sizing: border-box;
        }

        .nav-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-top: 12px;
            overflow-y: auto;
            flex-grow: 1;
        }

        .nav-item {
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            border-radius: 4px;
        }

        md-icon {
            font-family: 'Material Symbols Outlined';
        }

        .selected {
            font-weight: bold;
            background-color: rgba(0, 0, 0, 0.1);
        }

        h2 {
            margin: 0;
            padding: 0px;
            font-size: 1.2em;
        }
    `

    render() {
        const fontSize = this.inputData?.style?.fontSize ?? 16
        const iconFontSize = this.inputData?.style?.fontSize ?? 16 * 1.5
        const gap = fontSize * 0.4
        const lastRouteSegment = decodeURIComponent(this.route?.split('/').pop() || '')
        return html`
            <div
                class="wrapper"
                style="background-color: ${this.inputData?.style?.backgroundColor ||
                this.themeBgColor}; color: ${this.inputData?.style?.color || this.themeTitleColor};
                font-weight: ${this.inputData?.style?.fontWeight};
                font-size: ${fontSize}px;"
            >
                <h2 class="paging" ?active=${this.inputData?.title}>${this.inputData?.title}</h2>
                <div class="nav-list">
                    ${repeat(
                        this.inputData?.navItems || [],
                        (item) => item.label,
                        (item) => html`
                            <div
                                class="nav-item ${lastRouteSegment === item.route ? 'selected' : ''}"
                                style="gap: ${gap}px;"
                                @click=${() => this.handleNavItemClick(item)}
                            >
                                ${item.iconName
                                    ? html`<md-icon
                                          style="font-size: ${iconFontSize}px;width: ${iconFontSize}px;height: ${iconFontSize}px;"
                                          >${item.iconName}</md-icon
                                      >`
                                    : ''}
                                ${item.label}
                            </div>
                        `
                    )}
                </div>
            </div>
        `
    }
}
window.customElements.define('widget-sidenav-versionplaceholder', WidgetTextbox)
