$(document).ready(function() {
    
    $('#get-data').click(function () {
        var showData = $('#show-data');
        var showInfo = $('#show-qb-info');
        var Teams = [];
   
        $.getJSON('http://web.profootballfocus.com.s3-website-us-east-1.amazonaws.com/quarterbacks.json', function (data) {
          console.log(data);
          var playerList;

          //empty html for every click
          showData.empty();
          showData.append('<ul class="qb"></ul>');
          $("div .qb-stats").css("margin", "0");

          //list qb's from api
          //create html content
          if (data.players.length) {
            data.players.map(function(player) {
              var content1 = '<li id="' + player.player_id + '" ' + 'class="player">' + player.first_name + ' ' + player.last_name + '</li>';
              Teams.push({playerId: player.player_id, playerTeam: player.drafted_by});
              $(".qb").append(content1).css({"margin-top": "10px", "padding-left": "4px"});
            })
          }

            $(".player").click(function() {

              var $table = $("table .active-table");
              var playerId = getPlayerId(this);
              var playerName = getPlayerName(this);
              var playerTeam = Teams.filter(function(elem) {
                return elem.playerId === playerId;
              })[0].playerTeam;
              var qbHeaderContent = '<h1>' + playerName + ' <small>' + playerTeam + '</small></h1>';

              //refresh html for every player click
              $(".page-header").empty();
              $(".col-stat").empty();
              $(".page-header").append(qbHeaderContent);
              $(".col-md-8").css("margin", "auto 0");


              $.getJSON('http://web.profootballfocus.com.s3-website-us-east-1.amazonaws.com/quarterbacks.json', function(data) {
                
                //pinpoint qb's team for opponents column
                playerTeam = data.players.filter(function(player) {
                  return player.player_id === playerId;
                }).map(function(singlePlayer) {
                   return singlePlayer.drafted_by;
                });

                var statInfo = data.statistics.filter(function(stat) {
                //filter player id to qb
                    return stat.player_id === playerId
  
                }).map(function(weeklyStats) {

                //divide data into html content
                var statContent =
                  '<tr class="col-stat">' +
                  '<td class="col-stat">' + weeklyStats.week + '</td>' +
                  '<td class="col-stat">' + playerAgainst(playerTeam[0], weeklyStats.home_team, weeklyStats.away_team) + '</td>' +
                  '<td class="col-stat">' + weeklyStats.completions + '</td>' +
                  '<td class="col-stat">' + weeklyStats.attempts + '</td>' +
                  '<td class="col-stat">' + weeklyStats.yards + '</td>' +
                  '<td class="col-stat">' + weeklyStats.touchdowns + '</td>' +
                  '<td class="col-stat">' + weeklyStats.interceptions + '</td>' +
                  '<td class="col-stat">' + passerRating(weeklyStats.attempts, weeklyStats.completions, weeklyStats.yards, weeklyStats.touchdowns, weeklyStats.interceptions) + '</td>' +
                  '</tr>';

                $(".single-qb-stats").append(statContent);

                });
              });
            });
        });
    });


    function getPlayerId(elem) {
      return parseInt($(elem)[0].id);
      // console.log("elem", $(elem)[0]);
    }

    function getPlayerName(elem) {
      return $(elem)[0].innerText;
    }

    function playerAgainst(player, home, away) {
      return player === home ? away : "@" + home;
    }

    function passerRating(att, comp, yds, td, int) {
      var a = ((comp/att) - .3) * 5;
      var b = ((yds/att) - 3) * .25;
      var c = (td/att) * 20;
      var d = 2.375 - ((int/att) * 25);

      var net = function(calc) {
        var num = calc;
        if ( num> 2.375) {
          num = 2.375;
        } 
        if (num < 0) {
          num = 0;
        }
        return num;
      }
      return (((net(a) + net(b) + net(c) + net(d))/6) * 100).toFixed(2);
  }



});
