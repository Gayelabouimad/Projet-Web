<?php
    function redirect(){
        ob_start();
        header("Location: js_game_updated.html");
        ob_end_flush();
        die();
    }

    $message = '';
    $error = '';
    if(isset($_POST["submit"])){
        if(empty($_POST["name"])){
            $error = "<label class = 'text-danger'>Enter Name</label>";
        }
        else if(empty($_POST["gender"])){
            $error = "<label class = 'text-danger'>Enter Gender</label>";
        }
        else if(empty($_POST["designation"])){
            $error = "<label class = 'text-danger'>Enter Designation</label>";
        }
        else{
            if(file_exists('file.json')){
                $current_data = file_get_contents('file.json');
                $array_data = json_decode($current_data, true);
                $extra = array (
                    'name' => $_POST['name'],
                    'gender' => $_POST['gender'],
                    'designation' => $_POST['designation'],
                    // 'number' => $_POST['hiddenElement']
                );
                $array_data[] = $extra;
                $final_data = json_encode($array_data);
                if(file_put_contents('file.json', $final_data)){
                    $message = "<label class = 'text-success'>File Appended Succesfully</p>";
                }
            }
            else{
                $error = 'JSON File Not Found';               
            }
        }
    }
    redirect();
?>
