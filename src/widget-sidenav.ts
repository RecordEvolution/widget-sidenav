import { html, css, LitElement, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { SideNavigationConfiguration } from './definition-schema'

import '@material/web/icon/icon.js'

type Theme = {
    theme_name: string
    theme_object: any
}

/**
 * ECharts themes describe a *chart canvas*, and most of them set
 * `backgroundColor` to a fully transparent colour (the light theme uses
 * `rgba(0, 0, 0, 0)`). That is a valid, truthy colour string, so using it
 * verbatim as the nav background paints nothing at all. Treat any
 * fully transparent theme colour as "no colour" so the fallback kicks in.
 */
const isTransparent = (color?: string) => {
    if (!color) return true
    const value = color.trim().toLowerCase()
    if (value === 'transparent') return true
    const functional = value.match(/^(?:rgba|hsla)\([^)]*[,/]\s*([\d.]+%?)\s*\)$/)
    if (functional) return parseFloat(functional[1]) === 0
    // #rrggbbaa / #rgba
    if (/^#[0-9a-f]{8}$/.test(value)) return value.slice(7) === '00'
    if (/^#[0-9a-f]{4}$/.test(value)) return value[4] === '0'
    return false
}

@customElement('widget-sidenav-versionplaceholder')
export class WidgetSidenav extends LitElement {
    @property({ type: Object }) inputData?: SideNavigationConfiguration
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
        const themeBgColor = theme?.theme_object?.backgroundColor
        this.themeBgColor = `var(--re-tile-background-color, ${(isTransparent(themeBgColor) ? undefined : themeBgColor) || 'transparent'})`
        this.themeTitleColor = `var(--re-text-color, ${theme?.theme_object?.title?.textStyle?.color || 'inherit'})`
    }

    handleNavItemClick(route?: string) {
        // console.log('Navigating to:', item.route)
        const event = new CustomEvent('nav-submit', {
            detail: { path: String(route) },
            bubbles: true,
            composed: true
        })
        this.dispatchEvent(event)
    }

    trimRoute(route?: string) {
        route = String(route)
        if (!route) return ''
        return '/' + route.split('/').filter(Boolean).join('/')
    }

    resolveRoute(item?: any): string | undefined {
        let route = String(item?.route ?? '')
        if (item?.variables) {
            for (const variable of item.variables) {
                if (variable.label) {
                    route = route
                        .split(`{{${variable.label}}}`)
                        .join(encodeURIComponent(String(variable.value ?? '')))
                }
            }
        }
        if (route.includes('*')) {
            const currentSegments = (this.route || '').split('/').filter(Boolean)
            const routeSegments = route.split('/').filter(Boolean)
            for (let i = 0; i < routeSegments.length; i++) {
                if (routeSegments[i] === '*') {
                    routeSegments[i] = currentSegments[i] ?? ''
                }
            }
            route = (route.startsWith('/') ? '/' : '') + routeSegments.filter(Boolean).join('/')
        }
        return route
    }

    matchesRoute(itemRoute?: string) {
        if (itemRoute === undefined) return false
        itemRoute = String(itemRoute)
        const route = this.trimRoute(decodeURIComponent(this.route || '/'))
        const subRoute = this.trimRoute(itemRoute)
        if (itemRoute.startsWith('/')) {
            return route.startsWith(subRoute)
        } else {
            return route.endsWith(subRoute) || route === subRoute
        }
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

        .nav-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-top: 12px;
            overflow-y: auto;
            flex-grow: 1;
            /* Derive scrollbar colors from the (inherited) text color so they
               follow custom styles and themes — e.g. light thumb on dark nav. */
            scrollbar-width: thin;
            scrollbar-color: color-mix(in srgb, currentColor 35%, transparent) transparent;
        }

        /* WebKit/Blink fallback for browsers without scrollbar-color support. */
        .nav-list::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        .nav-list::-webkit-scrollbar-track {
            background: transparent;
        }

        .nav-list::-webkit-scrollbar-thumb {
            background-color: color-mix(in srgb, currentColor 35%, transparent);
            border-radius: 4px;
        }

        .nav-list::-webkit-scrollbar-thumb:hover {
            background-color: color-mix(in srgb, currentColor 55%, transparent);
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

        /* Derive the highlight from the (inherited) text color, like the
           scrollbar above — a fixed black wash is invisible on a dark nav. */
        .selected {
            background-color: color-mix(in srgb, currentColor 15%, transparent);
        }

        h2 {
            margin: 0;
            padding: 0px;
            font-size: 1.2em;
            /* the UA stylesheet forces bold, which would ignore the
               configured font weight */
            font-weight: inherit;
        }
    `

    render() {
        const fontSize = this.inputData?.style?.fontSize ?? 16
        const fontWeight = this.inputData?.style?.fontWeight ?? 400
        const iconFontSize = fontSize * 1.5
        const fontColor = this.inputData?.style?.color || this.themeTitleColor || 'black'
        const bgColor = this.inputData?.style?.backgroundColor || this.themeBgColor || 'white'
        const gap = fontSize * 0.4
        return html`
            <div
                class="wrapper"
                style="background-color: ${bgColor}; color: ${fontColor};
                font-weight: ${fontWeight};
                font-size: ${fontSize}px;"
            >
                <h2
                    class="paging"
                    style=${this.inputData?.route ? 'cursor: pointer' : ''}
                    ?active=${this.inputData?.title}
                    @click=${() =>
                        this.handleNavItemClick(
                            this.resolveRoute({
                                route: this.inputData?.route,
                                variables: this.inputData?.variables
                            })
                        )}
                >
                    ${this.inputData?.title}
                </h2>
                <div class="nav-list">
                    ${repeat(
                        this.inputData?.navItems || [],
                        (item) => item.label,
                        (item) => html`
                            <div
                                class="nav-item ${this.matchesRoute(this.resolveRoute(item))
                                    ? 'selected'
                                    : ''}"
                                style="gap: ${gap}px;"
                                @click=${() => this.handleNavItemClick(this.resolveRoute(item))}
                            >
                                ${item.iconName
                                    ? html`
                                          <md-icon style="--md-icon-size: ${iconFontSize}px;"
                                              >${item.iconName}
                                          </md-icon>
                                      `
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
