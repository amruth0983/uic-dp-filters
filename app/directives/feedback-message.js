(function() {
    'use strict';
    function feedbackMessage(dpShareDataService) {
        return {
            restrict : 'EA',
            scope : {
                feedbackData : '='
            },
            templateUrl : 'components/mos/materials/landing/partials/feedback-message.html',
            link : link
        }

        function link(scope, element, attr) {
            scope.print = function() {
                angular.element('body').addClass('feedback-message-active');
                window.print();
            }

            scope.dismissFeedback = function(action) {
                if(action === 'done') {
                    dpShareDataService.setObject({});
                    scope.feedbackData = {};
                    angular.element('body').removeClass('feedback-message-active');
                } else {

                }
            }
        }
    }
    feedbackMessage.$inject = ['dpShareDataService'];

    angular.module('DesignPortal')
    .directive('feedbackMessage', feedbackMessage);
}());
