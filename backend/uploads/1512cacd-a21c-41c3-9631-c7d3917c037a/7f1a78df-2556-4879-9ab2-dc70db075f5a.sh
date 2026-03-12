echo "enter 2 no."
read a b
echo " enter choice"
read choice
case $choice in
'+')y=`expr $a + $b`
echo "result is $y";;
'-')y=`expr $a - $b`
echo "result is $y";;
'*')y=`expr $a \* $b`
echo "result is $y";;
'/')
if [ $a -eq 0 ] || [ $b -eq 0 ]
then
echo "invalid"
else
y=`expr $a / $b`
echo "result is $y"
fi;;
esac
