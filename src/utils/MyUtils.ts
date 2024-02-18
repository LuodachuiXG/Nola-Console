/**
 * 根据之前存储的主题数据，初始化当前主题颜色
 * @return 返回当前的主题颜色：light / dark
 */
export const initTheme = () => {
    let theme = currentTheme();
    document.body.setAttribute("arco-theme", theme);
    return theme;
}


/**
 * 切换亮色或暗色主题
 * @return 返回切换后的主题颜色：light / dark
 */
export const changeTheme = () => {
    let theme = currentTheme();
    if (theme === "light") {
        document.body.setAttribute("arco-theme", "dark");
        localStorage.setItem("theme", "dark");
        return "dark";
    } else {
        document.body.setAttribute("arco-theme", "light");
        localStorage.setItem("theme", "light");
        return "light"
    }
}

/**
 * 返回当前主题颜色
 * @return 返回当前的主题颜色：light / dark
 */
export const currentTheme = () => {
    let theme = localStorage.getItem("theme") ?? "light"
    if (theme !== "light" && theme !== "dark") {
        theme = "light";
    }
    return theme;
}