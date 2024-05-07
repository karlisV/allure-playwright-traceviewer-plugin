'use strict';

const settings = allure.getPluginSettings('playwright-traceview-plugin', {default_trace_app_url: "https://trace.playwright.dev"});

    function getBasePath() {
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
    }

    function findTraceAttachment(data) {
        for(const stage of data.afterStages) {
            if (stage.attachments.length > 0){
                return stage.attachments.find(att => att.name === "trace-view");
            }
        }
    }

    const TraceAttachmentView = Backbone.Marionette.View.extend({

        initialize: function (attachment) {
            this.data = attachment;
        },

        templateContext: function() {
            return {
                traceViewUrl: settings.get("default_trace_app_url"),
                attachment: this.data
            };
        },

        template: function(data) {
            const attachmentLink = `${getBasePath()}data/attachments/${data.attachment.source}`;
            const pwTraceViewBaseUrl = data.traceViewUrl;
            return `<div class="trace-view-container">
                        <h4>Trace Data Visualization</h4>
                        <button class="open-trace-button" data-url="${pwTraceViewBaseUrl}?trace=${attachmentLink}">OPEN TRACE VIEWER</button>
                        <div class="trace-content"></div>
                    </div>`;
        },

        events: {
            'click .open-trace-button': 'openTraceViewer'
        },

        // Modify the openTraceViewer function to create and append an iframe to the desired location
        openTraceViewer: function(event) {
            event.preventDefault();
            const traceUrl = event.currentTarget.dataset.url;
            const traceIframe = document.createElement('iframe');
            traceIframe.src = traceUrl;
            traceIframe.width = '100%';
            traceIframe.height = '600px';
            traceIframe.frameBorder = '0';
            // Append the iframe to the test-result-overview div
            const testResultOverview = document.querySelector('.test-result-overview');
            testResultOverview.appendChild(traceIframe);
        }

    });

    const TestResultTraceView = Backbone.Marionette.View.extend({
        regions: {
            subView: '.trace-view-container',
        },
        template: function() {
            return '<div class="trace-view-container"></div>';
        },
        onRender: function() {
            const data = this.model.toJSON();
            const attachment = findTraceAttachment(data);
            if (attachment) {
                this.showChildView('subView', new TraceAttachmentView(attachment));
            }
        },
    });

    allure.api.addTestResultBlock(TestResultTraceView, { position: 'after' });
})();

allure.api.addTranslation('en', {
    tab: {
        traces: {
            name: 'Traces'
        }
    }
});

allure.api.addTab('traces', {
    title: 'tab.traces.name', icon: 'fa fa-eye',
    //below structure is similar to behaviours, need to understand how this works
    route: 'traces(/)(:testGroup)(/)(:testResult)(/)(:testResultTab)(/)',
    onEnter: (function (testGroup, testResult, testResultTab) {
        return new allure.components.TreeLayout({
            testGroup: testGroup,
            testResult: testResult,
            testResultTab: testResultTab,
            tabName: 'tab.traces.name',
            baseUrl: 'traces',
            url: 'data/traces.json',
            csvUrl: 'data/traces.csv'
        });
    })
});