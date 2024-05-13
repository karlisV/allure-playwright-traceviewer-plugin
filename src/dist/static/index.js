'use strict';

const TRACE_VIEW_APP_URL = "https://trace.playwright.dev"

const TraceView = Backbone.Marionette.View.extend({

    
    initialize: function (data) {
        this.data = data;
    },

    getBasePath: () => {
        let pathname = window.location.pathname;
        if (pathname.includes('/')) {
            const segments = pathname.split('/');
            const lastSegment = segments.pop();
            if (lastSegment.includes('.')) {
                pathname = segments.join('/');
            }
        }
        if (!pathname.endsWith('/')) {
            pathname += '/';
        }
        return window.location.protocol + '//' + window.location.host + pathname;
    },

    findTraceAttachment: (attachments) => {
        return attachments.find(att => att.name === "pw-trace");
    },


    template: function(data) {
        const att = this.findTraceAttachment(data.model.allAttachments);
        if (att) {
            const attachmentLink = `${this.getBasePath()}data/attachments/${att.source}`;
            const pwUrl = `${TRACE_VIEW_APP_URL}/?trace=${attachmentLink}`;
            console.log(pwUrl);
            return `<div class="trace-view-container">
            <a href="${pwUrl}" target="_blank">Open trace viewer in new tab</a>
            <div class="trace-content">
            <iframe src="${pwUrl}" width="100%" height="800px" frameborder="0" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
            </div>
            </div>`
        }
        return `<div class="trace-view-container"><p>no trace to load</p></div>` 
;
    },


    render: function () {
        this.$el.html(this.template(this.options));
        return this;
    },
});


allure.api.addTranslation('en', {
    testResult: {
        trace: {
            name: 'Trace'
        }
    }
});

allure.api.addTestResultTab("trace", "testResult.trace.name", TraceView);