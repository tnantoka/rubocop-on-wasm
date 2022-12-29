require 'js'

def Dir.home = "/home/me"

Dir.glob('/bundle/*').each do |dir|
  $LOAD_PATH << "#{dir}/lib"
end

require 'rubocop'
