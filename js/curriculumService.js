// js/curriculumService.js

const CurriculumService = {
  generatePlan: function (payload) {
    return new Promise(function (resolve, reject) {
      try {
        setTimeout(function () {
          const result = PlanGenerator.generatePlan(payload);
          resolve(result);
        }, 500);
      } catch (err) {
        reject(err);
      }
    });
  },
};
