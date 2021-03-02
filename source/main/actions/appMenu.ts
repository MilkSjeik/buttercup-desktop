import { Menu } from "electron";
import { VaultSourceStatus } from "buttercup";
import { getSourceDescriptions, lockAllSources } from "../services/buttercup";
import { closeWindows, openMainWindow } from "../services/windows";
import { t } from "../../shared/i18n/trans";

async function getContextMenu(): Promise<Menu> {
    const sources = getSourceDescriptions();
    return Menu.buildFromTemplate([
        {
            label: "Buttercup",
            submenu: [
                { label: t("app-menu.about") },
                {
                    label: t("app-menu.preferences"),
                    click: async () => {
                        const window = await openMainWindow();
                        window.webContents.send("open-preferences");
                    }
                },
                { type: "separator" },
                {
                    label: t("app-menu.close-window"),
                    click: () => closeWindows()
                },
                { label: t("app-menu.quit"), role: "quit" }
            ]
        },
        {
            label: t("app-menu.vault"),
            submenu: [
                {
                    label: t("app-menu.add-new-vault"),
                    click: async () => {
                        const window = await openMainWindow();
                        window.webContents.send("add-vault");
                    }
                },
                { type: "separator" },
                {
                    label: t("app-menu.unlock-vault"),
                    submenu: sources.map(source => ({
                        label: source.name,
                        enabled: source.state === VaultSourceStatus.Locked,
                        click: async () => {
                            const window = await openMainWindow(`/source/${source.id}`);
                            window.webContents.send("unlock-vault", source.id);
                        }
                    }))
                },
                {
                    label: t("app-menu.lock-all"),
                    click: () => lockAllSources()
                }
            ]
        },
        {
            label: t("app-menu.edit"),
            role: "editMenu"
        },
        {
            label: t("app-menu.debug"),
            submenu: [
                { label: t("app-menu.devtool"), role: "toggleDevTools" }
            ]
        }
    ]);
}

export async function updateAppMenu() {
    const menu = await getContextMenu();
    Menu.setApplicationMenu(menu);
}
