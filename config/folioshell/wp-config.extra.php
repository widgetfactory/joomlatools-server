if (getenv('APP_NAME') === 'joomlatools-server' && isset($_SERVER['HTTP_HOST']))
{
    $scheme = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ($_SERVER['REQUEST_SCHEME'] ?? 'http');

    if (isset($_SERVER['HTTP_X_FORWARDED_HOST']))
    {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_HOST']);
        $host  = $parts[count($parts) - 1];
    }
    else $host = $_SERVER['HTTP_HOST'];

    $url = $scheme.'://'.$host . rtrim($_SERVER['HTTP_X_SITE_BASE'], '/\\');

    define('WP_SITEURL', $url);
    define('WP_HOME', $url);

    require_once ABSPATH . 'wp-includes/plugin.php';

    add_filter('option_siteurl', function($option) {
        return WP_SITEURL;
    });
}