<?php
include 'db.php';

class Wraith
{
    protected $_db;
    // Has to be quadtree
    protected $_buffer = array();
    protected $_culled = 0;
    protected $_notCulled = 0;

    public function cull()
    {
        $db = new DB();
        $start = microtime(true);

        // loop through file
        $result = $db->getResult();
        while ($line = $result->fetch_assoc()) {
            $covered = $this->_isCovered(
                $line['x1'],
                $line['y1'],
                $line['x2'],
                $line['y2'],
                $line['width']
            );
            if ($covered) {
                $db->delete($line['id']);
                echo '.';
                $this->_culled++;
            } else {
                $this->_notCulled++;
            }
        }
        $result->close();
        $end = microtime(true) - $start;
        echo 'Culled '. $this->_culled . ' / '.$this->_notCulled.' lines in '. number_format($end) . ' s'.PHP_EOL;
    }

    protected function _isCovered($x1, $y1, $x2, $y2, $w)
    {
        $return = true;
        //     ---.----------.----------.
        //   /    |   \      .          |
        //  |     |    |     .          |
        //  |     o----|----------------o
        //  |     |    |                |
        //   \    |   /                 |
        //     ---'---------------------'
        //  
        $mask = array();
        // draw a circle around x1 y1
        for($x = 0 - $w; $x <= $w; $x++) {
            for($y = 0 - $w; $y <= $w; $y++) {
                // check for circle intersection
                $l = sqrt(pow($x, 2) + pow($y, 2));
                if (floor($l) <= $w) {
                    if (! isset($this->_buffer[$x1 + $x][$y1 + $y])) {
                        $return = false;
                        $this->_buffer[$x1 + $x][$y1 + $y] = true;
                    }
                }
            }
        }
        // draw a rectangle between 1 and 2
        if ($x1 != $x2 || $y1 != $y2) {
            for ($x = 0; $x <= (max($x1, $x2) + $w) - (min($x1, $x2) - $w); $x++) {
                for ($y = 0; $y <= (max($y1, $y2) + $w) - (min($y1, $y2) - $w); $y++) {
                    list($d, $outside) = $this->_p($x1, $y1, $x2, $y2, $x1+$x, $y1+$y);
                    if (floor($d) < $w && !$outside) {
                        if (! isset($this->_buffer[$x1 + $x][$y1 + $y])) {
                            $return = false;
                            $this->_buffer[$x1 + $x][$y1 + $y] = true;
                        }
                    }
                }
            }
        }

        return $return;
    }

    protected function _p($startX,$startY, $endX,$endY, $pointX,$pointY) {
        $r_numerator = ($pointX - $startX) * ($endX - $startX) + ($pointY - $startY) * ($endY - $startY);
        $r_denominator = ($endX - $startX) * ($endX - $startX) + ($endY - $startY) * ($endY - $startY);
        $r = $r_numerator / $r_denominator;

        $s = (($startY-$pointY) * ($endX - $startX) - ($startX - $pointX) * ($endY - $startY) ) / $r_denominator;

        $distanceLine = abs($s) * sqrt($r_denominator);
        
        $outside = false;
        if ( ($r >= 0) && ($r <= 1) ) {
           $outside = true;
        }    

        return array($distanceLine, $outside);
    }
}

$wraith = new Wraith();
$wraith->cull();