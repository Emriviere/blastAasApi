app.controller("blastAasCtrl",function($scope,$http,$q, Upload){
  console.log("Generating parameters");

  var apiUrlBase = "http://176.31.87.152";
  $scope.outputs = ["0","1","2","3","4","5","6","7"];

  //Getting database files
  getDbFilesList()
  function getDbFilesList(){
    url = apiUrlBase+"/files";
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

   $scope.dbMode = "prot";
   $scope.changeBlastDbMode = function(){
	console.log("changing blast db mode");
	if($scope.dbMode == "prot"){
		$scope.dbMode = "nucl";
	}else{
		$scope.dbMode = "prot";
	}
   }

   $scope.blastMode = "blastp";
   $scope.changeBlastMode =function(){
     console.log("Changing blast mode");
     if($scope.blastMode == "blastp"){
	$scope.blastMode = "blastn";
     }else{
        $scope.blastMode = "blastp";	
     }
   }
   

   $scope.uploadDb = function() {
    console.log("Let's upload"+$scope.dbFileToUpload)
     if ($scope.dbFileToUpload) {
       $scope.upload($scope.dbFileToUpload)
     }
   };

   $scope.upload = function(file){
     Upload.upload({
       url:apiUrlBase+'/upload',
       data:{file:file}
     }).then(function (resp) {
           $scope.uploadStatus = "File uploaded, creating blast database..."
            console.log('Success ' + resp.config.data.file.name + ' uploaded. Response: ' + resp.data);
            url = apiUrlBase+"/createblastdb?db="+resp.config.data.file.name+"&dbMode="+$scope.dbMode
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

   $scope.analyze = function() {
     console.log("Let's analyze this !")
     if ($scope.selectedDatabase && $scope.queryData) {

       url = apiUrlBase+"/"+$scope.blastMode+"/analyze?query="+$scope.queryData+"&db="+$scope.selectedDatabase+"&outputFormat="+$scope.outputFormat
       $http({
              method : 'GET',
              headers: {'Content-Type': 'application/json'},
              url : url
             }).then(function successCallback(response){
                  $scope.result=response.data;
             }, function errorCallback(response) {
              	  $scope.result = "Internal error: "+response.status+" \n Are you using the right blast mode?";
             });
            $scope.text = '';
          };
        }


})
