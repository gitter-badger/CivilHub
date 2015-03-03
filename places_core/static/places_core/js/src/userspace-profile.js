/*
 * userspace-profile.js
 * ====================
 * 
 * Profil użytkownika udostępniony do przeglądania przez inne osoby.
 */

require.config({
    
    baseUrl: window.STATIC_URL,
    
    urlArgs: "bust=" + (new Date()).getTime(),
    
    waitSeconds: 500,
    
    paths: {
        jquery     : "includes/jquery/jquery",
        jpaginate  : "includes/jquery/jquery.paginate",
        bootstrap  : "includes/bootstrap/bootstrap",
        underscore : "includes/underscore/underscore",
        backbone   : "includes/backbone/backbone",
        tagsinput  : "includes/jquery/jquery.tagsinput",
        bootbox    : "includes/bootstrap/bootbox",
        "tour": "includes/tour/bootstrap-tour",
        "moment": "includes/momentjs/moment"
    },
    
    shim: {
        underscore: {
            deps: ["jquery"],
            exports: "_"
        },
        
        backbone: {
            deps: ["underscore"],
            exports: "Backbone"
        },
        
        bootstrap: {
            deps: ["jquery"]
        },
        
        bootbox: {
            deps: ["bootstrap"],
            exports: "bootbox"
        },
        
        tagsinput: {
            deps: ["jquery"]
        },
    }
});

require(['jquery',
         'underscore',
         'js/modules/userspace/google-contacts',
         'js/modules/userspace/user-follow',
         'js/modules/common',
         'js/modules/userspace/actions/actions'],

function($, _, ContactListView) {

    "use strict";

    // Zapytanie do serwera o kontakty użytkownika.

    function fetchContacts (success) {
        $.ajax({
            url: 'https://www.google.com/m8/feeds/contacts/default/full?max-results=9999',
            dataType: 'jsonp',
            data: window.GOOGLE_DATA,
            success: function (data) {
                success(data);
            }
        });
    }
    
    // Konwersja XML do obiektu JS
    
    function parseContacts (xml) {
        
        xml = xml.replace(/gd:email/g, 'email'); // Błąd w Google Chrome
        
        var oParser = new DOMParser(),
            oDOM = oParser.parseFromString(xml, "text/xml"),
            contacts = [],
            name, address = '';

        if (oDOM.documentElement.nodeName == "parsererror") {
            return [{error: "Error while parsing server response"}];
        }
        
        $(oDOM).find('entry').each(function () {
            name = $(this).find('title').text();
            address = $(this).find('email').attr('address');
            if (name.length <= 1) name = address;
            contacts.push({name: name, address: address});
        });
        
        return contacts;
    }

    // Przypinamy wydarzenia i odpalamy skrypty
    
    $(document).ready(function () {
        
        if (GOOGLE_DATA !== undefined && GOOGLE_DATA.access_token) {
            
            var contacts;
            
            $('.contacts-toggle').show().on('click', function (e) {
                e.preventDefault();
                var $modal = $('#google-contacts-modal');
                $modal.one('shown.bs.modal', function () {
                    fetchContacts(function (data) {
                        $('#contact-list').empty();
                        contacts = new ContactListView({
                            contacts: parseContacts(data)
                        });
                    });
                });
                $modal.modal('toggle');
            });
        }
    });

    $(document).trigger('load');
});