if (getenv('APP_NAME') === 'joomlatools-server') {
    $scheme = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? $_SERVER['REQUEST_SCHEME'];

    if (isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_HOST']);
        $host  = $parts[count($parts) - 1];
    }
    else $host = $_SERVER['HTTP_HOST'];

    $url = $scheme.'://'.$host . rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');

    define('WP_SITEURL', $url);
    define('WP_HOME', $url);

    require_once ABSPATH . 'wp-includes/plugin.php';

    add_filter('option_siteurl', function($option) {
        return WP_SITEURL;
    });
}