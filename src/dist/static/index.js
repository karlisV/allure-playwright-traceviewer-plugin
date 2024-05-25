'use strict';

const TRACE_VIEW_APP_URL = "https://trace.playwright.dev"

const TraceView = Backbone.Marionette.View.extend({
    initialize: function(data) {
        this.data = data;
        this.fetchTraceContent();
    },

    getBasePath: function() {
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

    findTraceAttachment: function(attachments) {
        return attachments.find(att => att.name === "pw-trace");
    },

    fetchTraceContent: async function() {
        const att = this.findTraceAttachment(this.data.model.allAttachments);
        if (att && att.type.includes("text")) {
            const attachmentLink = `${this.getBasePath()}data/attachments/${att.source}`;
            try {
                const response = await fetch(attachmentLink);
                this.traceContent = await response.text();
            } catch (error) {
                console.error('Error fetching the attachment content:', error);
            }
            this.render();
        } else if (att && att.type.includes("zip")){
            this.traceContent = `${this.getBasePath()}data/attachments/${att.source}`;
            this.render();
        }
    },

    template: function() {
        if (this.traceContent) {
            const pwUrl = `${TRACE_VIEW_APP_URL}/?trace=${this.traceContent}`;
            return `<div class="trace-view-container">
                <a href="${pwUrl}" target="_blank">Open trace viewer in new tab</a>
                <div class="trace-content">
                <div class="spinner" id="trace-spinner"></div>
                    <iframe src="${pwUrl}" width="100%" height="800px" frameborder="0" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
                </div>
            </div>`;
        }
        return `<div class="trace-view-container"><p>No trace attached</p></div>`;
    },

    render: function() {
        this.$el.html(this.template());
        const iframe = this.$el.find('iframe');

        if (iframe.length) {
            iframe.on('load', function() {
                document.getElementById('trace-spinner').style.display = 'none';
            });
        }

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