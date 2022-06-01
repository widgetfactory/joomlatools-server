(function () {
  'use strict';

  /**
   * @copyright   (C) 2012 Open Source Matters, Inc. <https://www.joomla.org>
   * @license     GNU General Public License version 2 or later; see LICENSE.txt
   */
  Joomla = window.Joomla || {};

  (function (Joomla, document) {
    Joomla.submitbuttonUpload = function () {
      var form = document.getElementById('uploadForm'); // do field validation

      if (form.install_package.value === '') {
        alert(Joomla.Text._('COM_INSTALLER_MSG_INSTALL_PLEASE_SELECT_A_PACKAGE'), true);
      } else if (form.install_package.files[0].size > form.max_upload_size.value) {
        alert(Joomla.Text._('COM_INSTALLER_MSG_WARNINGS_UPLOADFILETOOBIG'), true);
      } else if (document.getElementById('joomlaupdate-confirm-backup').checked) {
        form.submit();
      }
    };

    Joomla.installpackageChange = function () {
      var form = document.getElementById('uploadForm');
      var fileSize = form.install_package.files[0].size;
      var fileSizeMB = fileSize * 1.0 / 1024.0 / 1024.0;
      var fileSizeElement = document.getElementById('file_size');
      var warningElement = document.getElementById('max_upload_size_warn');

      if (form.install_package.value === '') {
        fileSizeElement.classList.add('hidden');
        warningElement.classList.add('hidden');
      } else if (fileSize) {
        fileSizeElement.classList.remove('hidden');
        fileSizeElement.innerHTML = Joomla.sanitizeHtml(Joomla.Text._('JGLOBAL_SELECTED_UPLOAD_FILE_SIZE').replace('%s', fileSizeMB.toFixed(2) + " MB"));

        if (fileSize > form.max_upload_size.value) {
          warningElement.classList.remove('hidden');
        } else {
          warningElement.classList.add('hidden');
        }
      }
    };

    document.addEventListener('DOMContentLoaded', function () {
      var uploadButton = document.getElementById('uploadButton');
      var uploadField = document.getElementById('install_package');
      var installButton = document.querySelector('.emptystate-btnadd', document.getElementById('joomlaupdate-wrapper'));
      var updateCheck = document.getElementById('joomlaupdate-confirm-backup');
      var form = installButton ? installButton.closest('form') : null;
      var task = form ? form.querySelector('[name=task]', form) : null;

      if (uploadButton) {
        uploadButton.addEventListener('click', Joomla.submitbuttonUpload);
      }

      if (uploadField) {
        uploadField.addEventListener('change', Joomla.installpackageChange);
      } // Trigger (re-) install (including checkbox confirm if we update)


      if (installButton && installButton.getAttribute('href') === '#' && task) {
        installButton.addEventListener('click', function (e) {
          e.preventDefault();

          if (updateCheck && !updateCheck.checked) {
            return;
          }

          task.value = 'update.download';
          form.submit();
        });
      }
    });
  })(Joomla, document);

  (function (Joomla, document) {
    /**
     * PreUpdateChecker
     *
     * @type {Object}
     */
    var PreUpdateChecker = {};
    /**
     * Config object
     *
     * @type {{serverUrl: string, selector: string}}
     */

    PreUpdateChecker.config = {
      serverUrl: 'index.php?option=com_joomlaupdate&task=update.fetchextensioncompatibility',
      selector: '.extension-check'
    };
    /**
     * Extension compatibility states returned by the server.
     *
     * @type {{
     * INCOMPATIBLE: number,
     * COMPATIBLE: number,
     * MISSING_COMPATIBILITY_TAG: number,
     * SERVER_ERROR: number}}
     */

    PreUpdateChecker.STATE = {
      INCOMPATIBLE: 0,
      COMPATIBLE: 1,
      MISSING_COMPATIBILITY_TAG: 2,
      SERVER_ERROR: 3
    };

    PreUpdateChecker.cleanup = function (status) {
      // Set the icon in the nav-tab
      var infoIcon = document.querySelector('#joomlaupdate-precheck-extensions-tab .fa-spinner');
      var iconColor = 'success';
      var iconClass = 'check';

      switch (status) {
        case 'danger':
          iconColor = 'danger';
          iconClass = 'times';
          break;

        case 'warning':
          iconColor = 'warning';
          iconClass = 'exclamation-triangle';
          break;
      }

      if (infoIcon) {
        infoIcon.classList.remove('fa-spinner', 'fa-spin');
        infoIcon.classList.add("fa-" + iconClass, "text-" + iconColor, 'bg-white');
      } // Hide table of addons to load


      var checkedExtensions = document.querySelector('#compatibilityTable0');
      var preupdateCheckWarning = document.querySelector('#preupdateCheckWarning');

      if (checkedExtensions) {
        checkedExtensions.classList.add('hidden');
      }

      if (preupdateCheckWarning) {
        preupdateCheckWarning.classList.add('hidden');
      }
    };
    /**
     * Run the PreUpdateChecker.
     * Called by document ready, setup below.
     */


    PreUpdateChecker.run = function () {
      // eslint-disable-next-line no-undef
      PreUpdateChecker.nonCoreCriticalPlugins = Joomla.getOptions('nonCoreCriticalPlugins', []); // Grab all extensions based on the selector set in the config object

      var extensions = document.querySelectorAll(PreUpdateChecker.config.selector); // If there are no extensions to be checked we can exit here

      if (extensions.length === 0) {
        if (document.getElementById('preupdatecheckbox') !== null) {
          document.getElementById('preupdatecheckbox').style.display = 'none';
        }

        if (document.getElementById('noncoreplugins') !== null) {
          document.getElementById('noncoreplugins').checked = true;
        }

        [].slice.call(document.querySelectorAll('button.submitupdate')).forEach(function (el) {
          el.classList.remove('disabled');
          el.removeAttribute('disabled');
        });
        PreUpdateChecker.cleanup();
        return;
      } // Let the user make an update although there *could* be dangerous plugins in the wild


      var onChangeEvent = function onChangeEvent() {
        var nonCorePluginCheckbox = document.getElementById('noncoreplugins');

        if (nonCorePluginCheckbox.checked) {
          if (window.confirm(Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_POTENTIALLY_DANGEROUS_PLUGIN_CONFIRM_MESSAGE'))) {
            [].slice.call(document.querySelectorAll('button.submitupdate')).forEach(function (el) {
              el.classList.remove('disabled');
              el.removeAttribute('disabled');
            });
          } else {
            nonCorePluginCheckbox.checked = false;
          }
        } else {
          [].slice.call(document.querySelectorAll('button.submitupdate')).forEach(function (el) {
            el.classList.add('disabled');
            el.setAttribute('disabled', '');
          });
        }
      };

      if (document.getElementById('noncoreplugins') !== null) {
        document.getElementById('noncoreplugins').addEventListener('change', onChangeEvent);
      } // Get version of the available joomla update


      var joomlaUpdateWrapper = document.getElementById('joomlaupdate-wrapper');
      PreUpdateChecker.joomlaTargetVersion = joomlaUpdateWrapper.getAttribute('data-joomla-target-version');
      PreUpdateChecker.joomlaCurrentVersion = joomlaUpdateWrapper.getAttribute('data-joomla-current-version');
      [].slice.call(document.querySelectorAll('.compatibilitytoggle')).forEach(function (el) {
        el.addEventListener('click', function () {
          var compatibilityTable = el.closest('.compatibilityTable');

          if (el.dataset.state === 'closed') {
            el.dataset.state = 'open';
            el.innerHTML = Joomla.sanitizeHtml(Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSIONS_SHOW_LESS_COMPATIBILITY_INFORMATION'));
            [].slice.call(compatibilityTable.querySelectorAll('table .hidden')).forEach(function (elem) {
              elem.classList.remove('hidden');
            });
          } else {
            el.dataset.state = 'closed';
            el.innerHTML = Joomla.sanitizeHtml(Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSIONS_SHOW_MORE_COMPATIBILITY_INFORMATION'));
            [].slice.call(compatibilityTable.querySelectorAll('table .instver, table .upcomp, table .currcomp')).forEach(function (elem) {
              elem.classList.add('hidden');
            });
          }
        });
      }); // Grab all extensions based on the selector set in the config object

      [].slice.call(extensions).forEach(function (extension) {
        // Check compatibility for each extension, pass an object and a callback
        // function after completing the request
        PreUpdateChecker.checkCompatibility(extension, PreUpdateChecker.setResultView);
      });
    };
    /**
     * Check the compatibility for a single extension.
     * Requests the server checking the compatibility based
     * on the data set in the element's data attributes.
     *
     * @param {Object} extension
     * @param {callable} callback
     */


    PreUpdateChecker.checkCompatibility = function (node, callback) {
      // Result object passed to the callback
      // Set to server error by default
      var extension = {
        element: node,
        compatibleVersion: 0,
        serverError: 1
      }; // Request the server to check the compatibility for the passed extension and joomla version

      Joomla.request({
        url: PreUpdateChecker.config.serverUrl + "&joomla-target-version=" + encodeURIComponent(PreUpdateChecker.joomlaTargetVersion) + "&joomla-current-version=" + PreUpdateChecker.joomlaCurrentVersion + "&extension-version=" + node.getAttribute('data-extension-current-version') + "&extension-id=" + encodeURIComponent(node.getAttribute('data-extension-id')),
        onSuccess: function onSuccess(data) {
          var response = JSON.parse(data); // Extract the data from the JResponseJson object

          extension.serverError = 0;
          extension.compatibilityData = response.data; // Pass the retrieved data to the callback

          callback(extension);
        },
        onError: function onError() {
          extension.serverError = 1; // Pass the retrieved data to the callback

          callback(extension);
        }
      });
    };
    /**
     * Set the result for a passed extensionData object containing state compatible version
     *
     * @param {Object} extensionData
     */


    PreUpdateChecker.setResultView = function (extensionData) {
      var html = ''; // const direction = (document.dir !== undefined) ? document.dir : document.getElementsByTagName('html')[0].getAttribute('dir');
      // Process Target Version Extension Compatibility

      if (extensionData.serverError) {
        // An error occurred -> show unknown error note
        html = Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_SERVER_ERROR'); // Force result into group 4 = Pre update checks failed

        extensionData.compatibilityData = {
          resultGroup: 4
        };
      } else {
        // Switch the compatibility state
        switch (extensionData.compatibilityData.upgradeCompatibilityStatus.state) {
          case PreUpdateChecker.STATE.COMPATIBLE:
            if (extensionData.compatibilityData.upgradeWarning) {
              var compatibleVersion = Joomla.sanitizeHtml(extensionData.compatibilityData.upgradeCompatibilityStatus.compatibleVersion);
              html = "<span class=\"label label-warning\">" + compatibleVersion + "</span>"; // @TODO activate when language strings are correct

              /* if (compatibilitytypes.querySelector('#updateorangewarning')) {
                compatibilitytypes.querySelector('#updateorangewarning').classList.remove('hidden');
              } */
            } else {
              html = extensionData.compatibilityData.upgradeCompatibilityStatus.compatibleVersion === false ? Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_NO_COMPATIBILITY_INFORMATION') : Joomla.sanitizeHtml(extensionData.compatibilityData.upgradeCompatibilityStatus.compatibleVersion);
            }

            break;

          case PreUpdateChecker.STATE.INCOMPATIBLE:
            // No compatible version found -> display error label
            html = Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_NO_COMPATIBILITY_INFORMATION'); // @TODO activate when language strings are correct

            /* if (document.querySelector('#updateyellowwarning')) {
              document.querySelector('#updateyellowwarning').classList.remove('hidden');
            } */

            break;

          case PreUpdateChecker.STATE.MISSING_COMPATIBILITY_TAG:
            // Could not check compatibility state -> display warning
            html = Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_NO_COMPATIBILITY_INFORMATION'); // @TODO activate when language strings are correct

            /* if (document.querySelector('#updateyellowwarning')) {
              document.querySelector('#updateyellowwarning').classList.remove('hidden');
            } */

            break;

          default:
            // An error occurred -> show unknown error note
            html = Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_WARNING_UNKNOWN');
        }
      } // Insert the generated html


      extensionData.element.innerHTML = html; // Process Current Version Extension Compatibility

      html = '';

      if (extensionData.serverError) {
        // An error occurred -> show unknown error note
        html = Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_SERVER_ERROR');
      } else {
        // Switch the compatibility state
        switch (extensionData.compatibilityData.currentCompatibilityStatus.state) {
          case PreUpdateChecker.STATE.COMPATIBLE:
            html = extensionData.compatibilityData.currentCompatibilityStatus.compatibleVersion === false ? Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_NO_COMPATIBILITY_INFORMATION') : extensionData.compatibilityData.currentCompatibilityStatus.compatibleVersion;
            break;

          case PreUpdateChecker.STATE.INCOMPATIBLE:
            // No compatible version found -> display error label
            html = Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_NO_COMPATIBILITY_INFORMATION');
            break;

          case PreUpdateChecker.STATE.MISSING_COMPATIBILITY_TAG:
            // Could not check compatibility state -> display warning
            html = Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_NO_COMPATIBILITY_INFORMATION');
            break;

          default:
            // An error occurred -> show unknown error note
            html = Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_EXTENSION_WARNING_UNKNOWN');
        }
      } // Insert the generated html


      var extensionId = extensionData.element.getAttribute('data-extension-id');
      document.getElementById("available-version-" + extensionId).innerText = html;
      var compatType = document.querySelector("#compatibilityTable" + extensionData.compatibilityData.resultGroup + " tbody");

      if (compatType) {
        compatType.appendChild(extensionData.element.closest('tr'));
      } // Show the table


      document.getElementById("compatibilityTable" + extensionData.compatibilityData.resultGroup).classList.remove('hidden'); // Process the nonCoreCriticalPlugin list

      if (extensionData.compatibilityData.resultGroup === 3) {
        PreUpdateChecker.nonCoreCriticalPlugins = PreUpdateChecker.nonCoreCriticalPlugins // eslint-disable-next-line max-len
        .filter(function (ext) {
          return !(ext.package_id.toString() === extensionId || ext.extension_id.toString() === extensionId);
        });
      } // Have we finished?


      if (!document.querySelector('#compatibilityTable0 tbody td')) {
        document.getElementById('compatibilityTable0').classList.add('hidden');
        var status = 'success';
        PreUpdateChecker.nonCoreCriticalPlugins.forEach(function (plugin) {
          var problemPluginRow = document.querySelector("td[data-extension-id=\"" + plugin.extension_id + "\"]");

          if (!problemPluginRow) {
            problemPluginRow = document.querySelector("td[data-extension-id=\"" + plugin.package_id + "\"]");
          }

          if (problemPluginRow) {
            var tableRow = problemPluginRow.closest('tr');
            tableRow.classList.add('error');
            var pluginTitleTableCell = tableRow.querySelector('.exname');
            pluginTitleTableCell.innerHTML = Joomla.sanitizeHtml(pluginTitleTableCell.innerHTML) + "\n              <div class=\"small\">\n              <span class=\"badge bg-warning\">\n              <span class=\"icon-warning\"></span>\n              " + Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_POTENTIALLY_DANGEROUS_PLUGIN') + "\n              </span>\n\n              <button type=\"button\" class=\"btn btn-sm btn-link hasPopover\"\n              title=\"" + Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_POTENTIALLY_DANGEROUS_PLUGIN') + " \"\n              data-bs-content=\"" + Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_POTENTIALLY_DANGEROUS_PLUGIN_DESC') + " \"\n              >\n              " + Joomla.Text._('COM_JOOMLAUPDATE_VIEW_DEFAULT_HELP') + "\n              </button>\n              </div>";
            var popoverElement = pluginTitleTableCell.querySelector('.hasPopover');

            if (popoverElement) {
              popoverElement.style.cursor = 'pointer'; // eslint-disable-next-line no-new

              new bootstrap.Popover(popoverElement, {
                placement: 'top',
                html: true,
                trigger: 'focus'
              });
            }

            status = 'danger';
          }
        }); // Updates required

        if (document.querySelector('#compatibilityTable2 tbody td')) {
          status = 'danger';
        } else if (status !== 'danger' && document.querySelector('#compatibilityTable1 tbody td')) {
          status = 'warning';
        }

        if (PreUpdateChecker.nonCoreCriticalPlugins.length === 0 && status === 'success') {
          document.getElementById('preupdatecheckbox').style.display = 'none';
          document.getElementById('noncoreplugins').checked = true;
          [].slice.call(document.querySelectorAll('button.submitupdate')).forEach(function (el) {
            el.classList.remove('disabled');
            el.removeAttribute('disabled');
          });
        } else if (PreUpdateChecker.nonCoreCriticalPlugins.length > 0) {
          document.getElementById('preupdateCheckCompleteProblems').classList.remove('hidden');
        }

        PreUpdateChecker.cleanup(status);
      }
    };

    if (document.getElementById('preupdatecheck') !== null) {
      // Run PreUpdateChecker on document ready
      document.addEventListener('DOMContentLoaded', PreUpdateChecker.run, false);
    }
  })(Joomla, document);

})();