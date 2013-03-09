# thanks Ben!

require 'json'
require 'CSV'

stops = Array.new
CSV.foreach('stops.txt', :headers=>:first_row) do |row|
  stop = Hash.new
  stop[:id] = row[0]
  stop[:lat] = (row[4].to_f * 1000000).to_i
  stop[:lng] = (row[5].to_f * 1000000).to_i
  stops << stop
end

trains = Array.new
train = Hash.new
initTime = 0
i=1;
CSV.foreach('stop_times.txt', :headers=>:first_row) do |row|
  h = row[2][0,2].to_i
  m = row[2][3,2].to_i
  s = row[2][6,2].to_i
  if (!train[:id] or train[:id]!=row[0])
    trains << train
    train = Hash.new
    train[:s] = Array.new
    train[:id] = row[0]
    initTime = 3600*h + 60*m + s
    i=i+1
    if i==50 then
      break
    end
  end
  theTime = 3600*h + 60*m + s
  stop = stops.find{|x| x[:id]==row[3]}
  stop[:t] = (theTime - initTime) % (60*60*24)
  train[:s] << stop
end

trains = trains.drop(1)


output = trains.to_json
File.open('output.json', 'w') { |file| file.write(output) }