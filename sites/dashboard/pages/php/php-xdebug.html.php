---
@layout: 
    path: /default
    pageclass: embedded


name: Debugging and profiling
title: Joomlatools Server Xdebug
summary: PHP-Xdebug for Joomlatools Server
visible: true
---
        <section class="max-w-7xl mx-auto py-4 px-5<?= (!function_exists('xdebug_info')) ? ' h-full max-h-screen grid place-items-center' : '' ; ?>">

            <? if (!function_exists('xdebug_info')) : ?>

                <div class="flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700" role="alert">
                    <svg class="w-5 h-5 inline mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                    <div>
                        <p class="font-medium">Debugging and profiling is unavailable!</p>
                        <p>Please enable Xdebug by setting the <code>XDEBUG_ENABLE=0</code> value in your server root's <code>.env</code> file to <code>XDEBUG_ENABLE=1</code>.</p>
                        <p>Once you've done that you should restart your server with the following command <code>jtctl restart</code>.</p>
                        <p>Happy debugging and profiling!</p>
                    </div>
                </div>

            <? else : ?>

                <?= file_get_contents('http://localhost/__info/php-xdebug') ?>

            <? endif ?>

        </section>