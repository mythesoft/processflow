require([ 'jquery', 'app', 'main-nav-bar', 'main-view'], function($, app) {
  var $mainNavBar = $('.main-nav-bar');
  $mainNavBar.main_nav_bar();
  app.ui.mainNavBar = $mainNavBar;
  
  var $mainView = $('.main-view');
  $mainView.main_view();
  app.ui.mainView = $mainView;
  
  $mainView.main_view('createView', 'welcome', $('<div style="margin-left: 100px; margin-right:100px"><h1 style="align:center;">Sistema de criação de fluxos</h1>Primeiro teste de criação de fluxo<br><br>There is nothing to see here for the moment, just click on Flowchart at the left bar.</div>'));
  $mainView.main_view('showView', 'welcome');
  
  $mainNavBar.main_nav_bar('addButton', 'welcome', 'Welcome', '', 0, function() {
    $mainView.main_view('showView', 'welcome');
    $mainNavBar.main_nav_bar('activateButton', 'welcome');
  });
  $mainNavBar.main_nav_bar('activateButton', 'welcome');
  
  
  app.start(function() {    
    app.sendRequest(
      'get_js',
      {},
      function(data) {
        require.config({
          'paths': data.require_paths
        });
        
        require(data.main_js);
      }
    );
  });
});
