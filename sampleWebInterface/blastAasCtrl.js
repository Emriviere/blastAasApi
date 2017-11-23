app.controller("blastAasCtrl",function($scope,$http,$q, Upload){
  console.log("Generating parameters");

  //Getting database files
  getDbFilesList()
  function getDbFilesList(){
    url = "http://176.31.87.152:8080/files";
    $http({
      method : 'GET',
      headers: {'Content-Type': 'application/json'},
      url : url
     }).then(function successCallback(response){
          $scope.dbfiles=response.data["files"];
     }, function errorCallback(response) {
      console.log(response);
     });
  }


   $scope.uploadDb = function(dbFileToUpload) {
     if ($scope.dbUploadForm.dbFileToUpload.$valid && $scope.dbFileToUpload) {
       $scope.upload($scope.dbFileToUpload)
     }
   };

   $scope.upload = function(file){
     Upload.upload({
       url:'http://176.31.87.152:8080/upload',
       data:{file:file}
     }).then(function (resp) {
           $scope.uploadStatus = "File uploaded, creating blast database..."
            console.log('Success ' + resp.config.data.file.name + ' uploaded. Response: ' + resp.data);
            url = "http://176.31.87.152:8080/createblastdb?db="+resp.config.data.file.name
            $scope.uploadProgress = 0+"%"
            $http({
                   method : 'POST',
                   headers: {'Content-Type': 'application/json'},
                   url : url
            }).then(function successCallback(response){
              $scope.uploadProgresss = 100+"%"
                      $scope.uploadStatus = "Database properly created!"
                       getDbFilesList()
            }, function errorCallback(response) {
                   console.log(response);
            });
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.uploadProgress = progressPercentage
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };

   $scope.submit = function() {
     if ($scope.analyzeForm.queryData.$valid && $scope.analyzeForm.selectedDb.$valid) {
       url = "http://176.31.87.152:8080/blastp/analyze?query="+$scope.queryData+"&db="+$scope.selectedDatabase
       $http({
              method : 'GET',
              headers: {'Content-Type': 'application/json'},
              url : url
             }).then(function successCallback(response){
                  $scope.result=response.data;
             }, function errorCallback(response) {
              console.log(response);
             });
            $scope.text = '';
          };
        }


})
